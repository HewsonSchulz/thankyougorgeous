import json
from json.decoder import JSONDecodeError
from django.db import IntegrityError
from rest_framework import serializers, status
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from thankyougorgeousapi.models import Category
from .view_utils import calc_missing_props


class Categories(ViewSet):
    def list(self, request):
        try:
            return Response(
                CategorySerializer(
                    Category.objects.all(), many=True, context={'request': request}
                ).data
            )
        except Exception as ex:
            return Response(
                {'error': ex.args[0]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, pk=None):
        try:
            category = Category.objects.get(pk=pk)
            return Response(category.label)
        except Category.DoesNotExist as ex:
            return Response({'error': ex.args[0]}, status=status.HTTP_404_NOT_FOUND)
        except Exception as ex:
            return Response(
                {'error': ex.args[0]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request):
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

            if not req_user.is_admin:
                return Response(
                    {
                        'valid': False,
                        'message': '''You don't have permission to do that''',
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            if type(req_body) is not str:
                # object was submitted
                missing_props_msg = calc_missing_props(req_body, ['label'])

                if missing_props_msg:
                    return Response(
                        {'valid': False, 'message': missing_props_msg},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # create category
                new_category = Category.objects.create(label=req_body['label'].strip())

            else:
                # string was submitted
                # create category
                new_category = Category.objects.create(label=req_body.strip())

            return Response(new_category.label, status=status.HTTP_201_CREATED)
        except IntegrityError as ex:
            # handle constraint failure
            if 'UNIQUE constraint failed' in ex.args[0]:
                # UNIQUE constraint failed
                return Response(
                    {
                        'valid': False,
                        'message': 'Another category with that label already exists',
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

            if not req_user.is_admin:
                return Response(
                    {
                        'valid': False,
                        'message': '''You don't have permission to do that''',
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            try:
                # category was searched by id
                req_id = int(pk)
                category = Category.objects.get(pk=req_id)
            except ValueError:
                # category was searched by label
                req_id = pk
                category = Category.objects.get(label__iexact=req_id)

            if type(req_body) is not str:
                # object was submitted
                missing_props_msg = calc_missing_props(req_body, ['label'])

                if missing_props_msg:
                    return Response(
                        {'valid': False, 'message': missing_props_msg},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # update category
                category.label = req_body['label'].strip()

            else:
                # string was submitted
                # update category
                category.label = req_body.strip()

            category.save()

            return Response(category.label)
        except Category.DoesNotExist as ex:
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
                        'message': 'Another category with that label already exists',
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
        try:
            req_user = request.auth.user

            if not req_user.is_admin:
                return Response(
                    {'message': '''You don't have permission to do that'''},
                    status=status.HTTP_403_FORBIDDEN,
                )

            try:
                # category was searched by id
                req_id = int(pk)
                category = Category.objects.get(pk=req_id)
            except ValueError:
                # category was searched by label
                req_id = pk
                category = Category.objects.get(label__iexact=req_id)

            # delete category
            category.delete()

            return Response(status=status.HTTP_204_NO_CONTENT)

        except Category.DoesNotExist as ex:
            return Response({'error': ex.args[0]}, status=status.HTTP_404_NOT_FOUND)
        except Exception as ex:
            return Response(
                {'error': ex.args[0]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['label']

    def to_representation(self, instance):
        return instance.label
