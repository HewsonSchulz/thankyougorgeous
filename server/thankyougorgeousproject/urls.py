from django.contrib import admin
from django.urls import include, path
from rest_framework import routers
from thankyougorgeousapi.views import register_user, login_user, Profile, Products

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'profile', Profile, 'profile')
router.register(r'products', Products, 'product')

urlpatterns = [
    path('', include(router.urls)),
    path('register', register_user),
    path('login', login_user),
]
