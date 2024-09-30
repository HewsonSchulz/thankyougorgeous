import json
from json.decoder import JSONDecodeError
from django.db import IntegrityError
from rest_framework import serializers, status
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from thankyougorgeousapi.models import Interest, User, Product
from collections import defaultdict
from .profile import UserSerializer


class Interests(ViewSet):
    def list(self, request):
        try:
            req_user = request.auth.user

            if not req_user.is_admin:
                # get only user's interests
                interests = Interest.objects.filter(user=req_user)

                user_interests = []
                for interest in interests:
                    user_interests.append(interest.product.label)

                return Response(user_interests)

            # get all interests
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
            interests = Interest.objects.filter(user=user)

            user_interests = []
            for interest in interests:
                user_interests.append(interest.product.label)

            return Response(user_interests)
        except User.DoesNotExist as ex:
            return Response({'error': ex.args[0]}, status=status.HTTP_404_NOT_FOUND)
        except Exception as ex:
            return Response(
                {'error': ex.args[0]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request):
        req_user = request.auth.user
        req_product = request.query_params.get('product')

        if req_product is None:
            return Response(
                {
                    'valid': False,
                    'message': 'Missing property: product',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            try:
                # product was searched by id
                req_id = int(req_product)
                product = Product.objects.get(pk=req_id)
            except ValueError:
                # product was searched by label
                product = Product.objects.get(label__iexact=req_product)

            interest = Interest.objects.create(user=req_user, product=product)

            interest.save()

            return Response(status=status.HTTP_204_NO_CONTENT)
        except Product.DoesNotExist as ex:
            return Response(
                {'valid': False, 'error': ex.args[0]}, status=status.HTTP_404_NOT_FOUND
            )
        except IntegrityError as ex:
            # handle constraint failure
            if 'UNIQUE constraint failed' in ex.args[0]:
                # UNIQUE constraint failed
                return Response(
                    {
                        'valid': False,
                        'message': 'You are already interested in this product',
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            else:
                return Response(
                    {'valid': False, 'error': ex.args[0]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as ex:
            return Response(
                {'error': ex.args[0]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, pk=None):
        req_user = request.auth.user

        if pk is None:
            return Response(
                {
                    'valid': False,
                    'message': 'Missing property: product',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            try:
                # product was searched by id
                req_id = int(pk)
                product = Product.objects.get(pk=req_id)
            except ValueError:
                # product was searched by label
                product = Product.objects.get(label__iexact=pk)

            interest = Interest.objects.get(user=req_user, product=product)

            interest.delete()

            return Response(status=status.HTTP_204_NO_CONTENT)
        except (Product.DoesNotExist, Interest.DoesNotExist) as ex:
            return Response(
                {'valid': False, 'error': ex.args[0]}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as ex:
            return Response(
                {'error': ex.args[0]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, pk=None):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


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
