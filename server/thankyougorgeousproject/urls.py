from rest_framework import routers
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from thankyougorgeousapi.views import (
    register_user,
    login_user,
    Profile,
    Products,
    Categories,
    Orders,
)

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'profile', Profile, 'profile')
router.register(r'products', Products, 'product')
router.register(r'categories', Categories, 'category')
router.register(r'orders', Orders, 'order')

urlpatterns = [
    path('', include(router.urls)),
    path('register', register_user),
    path('login', login_user),
]


urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
