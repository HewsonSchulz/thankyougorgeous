import json
from json.decoder import JSONDecodeError
from rest_framework import serializers, status
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from thankyougorgeousapi.models import User


def update_user_attributes(user, attributes):
    for attr, value in attributes.items():
        if value is not None:
            setattr(user, attr, value.strip() if isinstance(value, str) else value)


class Profile(ViewSet):
    def list(self, request):
        try:
            user = request.auth.user

            return Response(
                UserSerializer(user, many=False, context={'request': request}).data
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
            return Response(
                {'message': 'The requested user does not exist', 'error': ex.args[0]},
                status=status.HTTP_404_NOT_FOUND,
            )
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
                # TODO? allow for non-pk specified PUT requests
                # pk was not provided
                user = req_user
            else:
                # pk was provided
                if not (req_user.is_admin or req_user.id == int(pk)):
                    return Response(
                        {'message': '''You don't have permission to do that'''},
                        status=status.HTTP_403_FORBIDDEN,
                    )
                user = User.objects.get(pk=pk)

            # update user
            writable_fields = [
                'first_name',
                'last_name',
                'phone_num',
                'venmo',
                'address',
            ]
            # TODO: update password (requires `old_password`, `password`, and `password_conf`)
            update_user_attributes(
                user, {field: req_body.get(field) for field in writable_fields}
            )

            user.save()

            return Response(
                UserSerializer(user, context={'request': request}).data,
                status=status.HTTP_200_OK,
            )

        except User.DoesNotExist:
            return Response(
                {'message': 'The requested user does not exist'},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as ex:
            return Response(
                {'error': ex.args[0]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
