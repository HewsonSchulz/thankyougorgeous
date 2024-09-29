from rest_framework import serializers, status
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from thankyougorgeousapi.models import Interest
from collections import defaultdict
from .profile import UserSerializer


class Interests(ViewSet):
    def list(self, request):
        try:
            req_user = request.auth.user

            if not req_user.is_admin:
                interests = Interest.objects.filter(user=req_user)

                user_interests = []
                for interest in interests:
                    user_interests.append(interest.product.label)

                return Response(user_interests)

            interests = Interest.objects.all().select_related('user', 'product')

            # organize interests by user, keeping only product labels
            user_interests = defaultdict(list)
            for interest in interests:
                user_name = UserSerializer(interest.user).data['full_name']
                user_interests[user_name].append(interest.product.label)

            return Response(dict(user_interests))
        except Exception as ex:
            return Response(
                {'error': ex.args[0]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, pk=None):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)  #!

    def create(self, request):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)  #!

    def update(self, request, pk=None):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)  #!

    def destroy(self, request, pk=None):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)  #!


class InterestSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    product = serializers.SerializerMethodField()

    class Meta:
        model = Interest
        fields = ['id', 'created', 'user', 'product']

    def get_user(self, obj):
        return UserSerializer(obj.user).data['full_name']

    def get_product(self, obj):
        return obj.product.label
