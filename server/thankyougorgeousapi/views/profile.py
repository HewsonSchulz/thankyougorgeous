import json
from json.decoder import JSONDecodeError
from django.db import IntegrityError
from django.contrib.auth import authenticate
from rest_framework import serializers, status
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from thankyougorgeousapi.models import User
from .view_utils import calc_missing_props


def update_user_attributes(user, attributes):
    for attr, value in attributes.items():
        if attr == 'password':
            if value is None or value == '':
                raise ValidationError('You cannot submit a blank password')

            # encrypt password
            user.set_password(value)
        elif hasattr(user, attr):
            # only update if attribute exists in model
            if isinstance(value, str):
                setattr(user, attr, value.strip())
            else:
                setattr(user, attr, value)


class Profile(ViewSet):
    def list(self, request):
        try:
            req_user = request.auth.user

            return Response(
                UserSerializer(req_user, many=False, context={'request': request}).data
            )
        except Exception as ex:
            return Response(
                {'error': ex.args[0]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, pk=None):
        try:
            req_user = request.auth.user

            if not (req_user.is_admin or req_user.id == int(pk)):
                # user has invalid permission
                return Response(
                    {
                        'message': '''You don't have permission to view that information'''
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            user = User.objects.get(pk=pk)

            return Response(
                UserSerializer(user, many=False, context={'request': request}).data
            )

        except User.DoesNotExist as ex:
            return Response({'error': ex.args[0]}, status=status.HTTP_404_NOT_FOUND)
        except Exception as ex:
            return Response(
                {'error': ex.args[0]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, pk=None):
        try:
            req_body = json.loads(request.body)
        except JSONDecodeError as ex:
            return Response(
                {
                    'valid': False,
                    'message': 'Your request contains invalid json',
                    'error': ex.args[0],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            req_user = request.auth.user

            if pk is None:
                # TODO? allow for unspecified pk PUT requests
                # pk was not provided
                user = req_user
            else:
                # pk was provided
                if not (req_user.is_admin or req_user.id == int(pk)):
                    return Response(
                        {
                            'valid': False,
                            'message': '''You don't have permission to do that''',
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )
                user = User.objects.get(pk=pk)

            # update user
            if req_body.get('password') is not None:
                # change password
                if req_body['password'] == '':
                    return Response(
                        {
                            'valid': False,
                            'message': 'You cannot submit a blank password',
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                missing_props_msg = calc_missing_props(
                    req_body, ['password_conf', 'old_password']
                )
                if missing_props_msg:
                    return Response(
                        {'valid': False, 'message': missing_props_msg},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                auth_user = authenticate(
                    email=req_user.email, password=req_body['old_password']
                )
                if not auth_user:
                    # cannot validate user
                    return Response(
                        {
                            'valid': False,
                            'message': 'Your original password was entered incorrectly',
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

                if req_body['password'] != req_body['password_conf']:
                    return Response(
                        {
                            'valid': False,
                            'message': 'Your password confirmation does not match',
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            writable_fields = [
                'first_name',
                'last_name',
                'phone_num',
                'venmo',
                'address',
                'password',
            ]
            update_user_attributes(
                user,
                {
                    field: req_body[field]
                    for field in writable_fields
                    if field in req_body
                },
            )

            user.save()

            return Response(
                {
                    'valid': True,
                    **UserSerializer(user, context={'request': request}).data,
                },
                status=status.HTTP_200_OK,
            )

        except User.DoesNotExist as ex:
            return Response(
                {'valid': False, 'error': ex.args[0]}, status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as ex:
            # handle blank password submission
            return Response(
                {'valid': False, 'message': ex.args[0]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except IntegrityError as ex:
            # handle constraint failure
            return Response(
                {'valid': False, 'error': ex.args[0]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as ex:
            return Response(
                {'valid': False, 'error': ex.args[0]},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'date_joined',
            'last_login',
            'phone_num',
            'venmo',
            'address',
        ]

    def get_full_name(self, user):
        if user.first_name or user.last_name:
            return f'{user.first_name} {user.last_name}'.strip()

        return user.username
