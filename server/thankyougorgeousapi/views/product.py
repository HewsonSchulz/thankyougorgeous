from rest_framework import serializers, status
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from thankyougorgeousapi.models import Product


class Products(ViewSet):
    def list(self, request):
        try:
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
                    Product.objects.get(pk=pk), many=False, context={'request': request}
                ).data
            )
        except Product.DoesNotExist as ex:
            return Response({'error': ex.args[0]}, status=status.HTTP_404_NOT_FOUND)
        except Exception as ex:
            return Response(
                {'error': ex.args[0]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'created', 'label', 'price', 'description']
