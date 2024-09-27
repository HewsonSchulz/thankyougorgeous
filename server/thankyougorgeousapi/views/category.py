from rest_framework import serializers, status
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from thankyougorgeousapi.models import Product, Category


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
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)  #!

    def update(self, request, pk=None):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)  #!

    def destroy(self, request, pk=None):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)  #!


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['label']

    def to_representation(self, instance):
        return instance.label
