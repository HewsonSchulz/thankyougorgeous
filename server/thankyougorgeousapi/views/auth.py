import os
import json
from json.decoder import JSONDecodeError
from django.http import HttpResponseNotAllowed, JsonResponse
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.authtoken.models import Token
from .view_utils import calc_missing_props, generate_verification_code
from thankyougorgeousapi.models import User, EmailCode
from .profile import UserSerializer


@csrf_exempt
def register_user(request):
    '''user creation'''

    if request.method == 'POST':
        try:
            req_body = json.loads(request.body)
        except JSONDecodeError as ex:
            return JsonResponse(
                {
                    'valid': False,
                    'message': 'Your request contains invalid json',
                    'error': ex.args[0],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        missing_props_msg, missing_props = calc_missing_props(
            req_body, ['email', 'password', 'password_conf']
        )
        if missing_props_msg:
            return JsonResponse(
                {
                    'valid': False,
                    'message': missing_props_msg,
                    'missing_props': missing_props,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        password = req_body['password']

        if password != req_body['password_conf']:
            return JsonResponse(
                {
                    'valid': False,
                    'message': 'Your password confirmation does not match',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = req_body['email'].strip()
        username = email.split('@')[0]

        if User.objects.filter(email=email).exists():
            # email is taken
            return JsonResponse(
                {'valid': False, 'message': 'That email is already in use'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ver_code = request.GET.get('verification_code', '')

        if ver_code == '':
            # initial register request

            ver_code = generate_verification_code()

            EmailCode.objects.create(email=email, code=ver_code)

            # remove outdated verification codes
            EmailCode.objects.clean_up_old_codes()

            subject = 'Verify your email | ThankyouGorgeous.com'
            message = f'''Your email verification code is {ver_code}.

This code will expire in 10 minutes.'''

            # send email
            send_mail(
                subject=subject,
                message=message,
                from_email=os.getenv('EMAIL_HOST_USER'),
                recipient_list=[email],
                fail_silently=True,
            )

            return JsonResponse(
                {'valid': True, 'message': 'Your email verification code has been sent'}
            )
        else:
            # verified register request

            # remove outdated verification codes
            EmailCode.objects.clean_up_old_codes()

            my_email_code = EmailCode.objects.filter(email=email).first()

            if my_email_code and my_email_code.code == ver_code:
                # create new user
                new_user = User.objects.create_user(
                    email=email,
                    username=username,
                    password=password,
                    first_name=req_body.get('first_name', '').strip(),
                    last_name=req_body.get('last_name', '').strip(),
                )

                # create new token
                token = Token.objects.create(user=new_user)

                # login user
                new_user.last_login = timezone.now()
                new_user.save()

                # TODO: if `new_user.id` is `1`, set `is_admin` to `True` by default

                # serialize user data
                user_data = UserSerializer(new_user, context={'request': request}).data

                return JsonResponse(
                    {'valid': True, 'token': token.key, **user_data},
                    status=status.HTTP_201_CREATED,
                )
            else:
                return JsonResponse(
                    {
                        'valid': False,
                        'message': 'That verification code is expired or incorrect',
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

    return HttpResponseNotAllowed(['POST'])


@csrf_exempt
def login_user(request):
    '''user authentication'''

    if request.method == 'POST':
        try:
            req_body = json.loads(request.body)
        except JSONDecodeError as ex:
            return JsonResponse(
                {
                    'valid': False,
                    'message': 'Your request contains invalid json',
                    'error': ex.args[0],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        missing_props_msg, missing_props = calc_missing_props(
            req_body, ['email', 'password']
        )
        if missing_props_msg:
            return JsonResponse(
                {
                    'valid': False,
                    'message': missing_props_msg,
                    'missing_props': missing_props,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        auth_user = authenticate(email=req_body['email'], password=req_body['password'])

        if auth_user:
            # user exists
            auth_user.last_login = timezone.now()
            auth_user.save()

            token = Token.objects.get(user=auth_user)

            # serialize user data
            user_data = UserSerializer(auth_user, context={'request': request}).data

            return JsonResponse({'valid': True, 'token': token.key, **user_data})
        else:
            # user does not exist
            return JsonResponse(
                {'valid': False, 'message': 'Invalid email or password'},
                status=status.HTTP_404_NOT_FOUND,
            )

    return HttpResponseNotAllowed(['POST'])
