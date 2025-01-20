import json
from json.decoder import JSONDecodeError
from rest_framework import serializers, status
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from thankyougorgeousapi.models import Order, Product, OrderProduct
from .product import ProductSerializer
from .view_utils import calc_missing_props


class Orders(ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request):
        try:
            req_user = request.auth.user

            # regular users can only see their own orders
            # admins can see all orders
            if req_user.is_admin:
                orders = Order.objects.all()
            else:
                orders = Order.objects.filter(user=req_user)

            return Response(
                OrderSerializer(orders, many=True, context={'request': request}).data
            )
        except Exception as ex:
            return Response(
                {'error': ex.args[0]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, pk=None):
        try:
            req_user = request.auth.user
            order = Order.objects.get(pk=pk)

            # check if user has permission to view this order
            if not (req_user.is_admin or order.user.id == req_user.id):
                return Response(
                    {
                        'message': '''You don't have permission to view that information'''
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            return Response(OrderSerializer(order, context={'request': request}).data)
        except Order.DoesNotExist as ex:
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

            # validate products are provided
            missing_props_msg, missing_props = calc_missing_props(
                req_body, ['products']
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

            # check if all products exist and have sufficient quantity
            for product_id in req_body['products']:
                try:
                    product = Product.objects.get(pk=product_id)
                    if product.quantity < 1:
                        return Response(
                            {
                                'valid': False,
                                'message': f''''{product.label}' is no longer in stock.''',
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                except Product.DoesNotExist:
                    return Response(
                        {
                            'valid': False,
                            'message': f'Product with id {product_id} not found',
                        },
                        status=status.HTTP_404_NOT_FOUND,
                    )

            # create order
            order = Order.objects.create(user=req_user)

            # add products to order and decrease quantities
            for product_id in req_body['products']:
                product = Product.objects.get(pk=product_id)
                OrderProduct.objects.create(order=order, product=product)
                product.quantity -= 1
                product.save()

            return Response(
                {
                    'valid': True,
                    **OrderSerializer(order, context={'request': request}).data,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as ex:
            return Response(
                {'error': ex.args[0]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, pk=None):
        try:
            req_user = request.auth.user
            order = Order.objects.get(pk=pk)

            # only admins can delete orders
            if not req_user.is_admin:
                return Response(
                    {'message': '''You don't have permission to do that'''},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # restore product quantities
            order_products = OrderProduct.objects.filter(order=order)
            for order_product in order_products:
                product = order_product.product
                product.quantity += 1
                product.save()

            order.delete()

            return Response(status=status.HTTP_204_NO_CONTENT)

        except Order.DoesNotExist as ex:
            return Response({'error': ex.args[0]}, status=status.HTTP_404_NOT_FOUND)
        except Exception as ex:
            return Response(
                {'error': ex.args[0]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OrderSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()
    user_full_name = serializers.SerializerMethodField()
    products = ProductSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'created',
            'completed',
            'user_email',
            'user_full_name',
            'products',
        ]

    def get_user_email(self, obj):
        return obj.user.email

    def get_user_full_name(self, obj):
        if obj.user.first_name or obj.user.last_name:
            return f'{obj.user.first_name} {obj.user.last_name}'.strip()
        return obj.user.username
