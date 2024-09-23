from rest_framework import serializers, status
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from thankyougorgeousapi.models import User


class Profile(ViewSet):
    def list(self, request):
        try:
            user = request.auth.user

            return Response(
                UserSerializer(user, many=False, context={'request': request}).data
            )
        except Exception as ex:
            return Response(
                {'error': ex.args[0]},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
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
                {'error': ex.args[0]},
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
        ]

    def get_full_name(self, user):
        if user.first_name or user.last_name:
            return f'{user.first_name} {user.last_name}'.strip()

        return user.username
