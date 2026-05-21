from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PromotionSettingsView, HeroSettingsView, HeroSlideViewSet, CompanyProfileView

router = DefaultRouter()
router.register(r'settings/hero/slides', HeroSlideViewSet, basename='hero-slide')

urlpatterns = [
    path('settings/promotions/', PromotionSettingsView.as_view(), name='promotion-settings'),
    path('settings/hero/', HeroSettingsView.as_view(), name='hero-settings'),
    path('settings/company-profile/', CompanyProfileView.as_view(), name='company-profile'),
    path('', include(router.urls)),
]
