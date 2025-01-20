import json
from json.decoder import JSONDecodeError
from django.db import IntegrityError
from rest_framework import serializers, status
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from thankyougorgeousapi.models import Product, Category
from .view_utils import calc_missing_props, update_object_attributes
from collections import Counter


class Products(ViewSet):
    authentication_classes = [TokenAuthentication]

    def get_permissions(self):
        # allows certain views (`list` and `retrieve`) to be accessed by anyone
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def list(self, request):
        try:
            products_param = request.query_params.get('products', None)

            if products_param:
                # parse the products parameter
                try:
                    product_ids = json.loads(products_param)
                    if not isinstance(product_ids, list):
                        raise ValueError('''The 'products' parameter must be a list.''')
                except (JSONDecodeError, ValueError) as ex:
                    return Response(
                        {'error': f'''Invalid 'products' parameter: {ex.args[0]}'''},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # count occurrences of each product id
                product_counts = Counter(product_ids)

                # fetch products and include count
                products = Product.objects.filter(id__in=product_counts.keys())
                serialized_products = []
                for product in products:
                    serialized_data = ProductSerializer(
                        product, context={'request': request}
                    ).data
                    serialized_data['quantity'] = product_counts[product.id]
                    serialized_data['price'] = (
                        serialized_data['price'] * product_counts[product.id]
                    )
                    serialized_products.append(serialized_data)

                return Response(serialized_products)

            # return all products
            return Response(
                ProductSerializer(
                    Product.objects.all(), many=True, context={'request': request}
                ).data
            )
        except Exception as ex:
            return Response(
                {'error': ex.args[0]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, pk=None):
        try:
            return Response(
                ProductSerializer(
                    Product.objects.get(pk=pk), context={'request': request}
                ).data
            )
        except Product.DoesNotExist as ex:
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

            missing_props_msg, missing_props = calc_missing_props(
                req_body, ['label', 'price', 'description', 'quantity']
            )

            if missing_props_msg:
                return Response(
                    {
                        'valid': False,
                        'message': missing_props_msg,
                        'missing_props': missing_props,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # ensure all specified categories exist
            categories = []
            if req_body.get('categories'):
                for category_label in req_body['categories']:
                    category = Category.objects.get(label=category_label.strip())
                    categories.append(category)

            # create product
            new_product = Product.objects.create(
                label=req_body['label'].strip(),
                price=req_body['price'],
                quantity=req_body['quantity'],
                description=req_body['description'].strip(),
            )

            # add categories to product
            new_product.categories.add(*categories)

            return Response(
                {
                    'valid': True,
                    **ProductSerializer(new_product, context={'request': request}).data,
                },
                status=status.HTTP_201_CREATED,
            )
        except Category.DoesNotExist as ex:
            return Response({'error': ex.args[0]}, status=status.HTTP_404_NOT_FOUND)
        except IntegrityError as ex:
            # handle constraint failure
            if 'UNIQUE constraint failed' in ex.args[0]:
                # UNIQUE constraint failed
                return Response(
                    {
                        'valid': False,
                        'message': 'Another product with that label already exists',
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

            product = Product.objects.get(pk=pk)

            # update product
            writable_fields = [
                'label',
                'price',
                'description',
                'quantity',
                'categories',
            ]
            update_object_attributes(
                product,
                {
                    field: req_body[field]
                    for field in writable_fields
                    # skip categories
                    if field in req_body and field is not 'categories'
                },
            )

            # update product's categories
            categories = []
            if req_body.get('categories'):
                for category_label in req_body['categories']:
                    category = Category.objects.get(label=category_label.strip())
                    categories.append(category)
                product.categories.set(categories)

            product.save()

            return Response(
                {
                    'valid': True,
                    **ProductSerializer(product, context={'request': request}).data,
                }
            )

        except (Product.DoesNotExist, Category.DoesNotExist) as ex:
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
                        'message': 'Another product with that label already exists',
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
                {'valid': False, 'error': ex.args[0]},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def destroy(self, request, pk=None):
        try:
            req_user = request.auth.user

            if not req_user.is_admin:
                return Response(
                    {'message': '''You don't have permission to do that'''},
                    status=status.HTTP_403_FORBIDDEN,
                )

            product = Product.objects.get(pk=pk)

            # delete product
            product.delete()

            return Response(status=status.HTTP_204_NO_CONTENT)

        except Product.DoesNotExist as ex:
            return Response({'error': ex.args[0]}, status=status.HTTP_404_NOT_FOUND)
        except Exception as ex:
            return Response(
                {'error': ex.args[0]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProductSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'created',
            'label',
            'quantity',
            'price',
            'description',
            'quantity',
            'categories',
        ]

    def get_categories(self, obj):
        return [category.label for category in obj.categories.all()]
