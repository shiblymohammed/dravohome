from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions
from .models import PromotionSettings, HeroSettings, HeroSlide, MediaAsset, CompanyProfile
from .serializers import PromotionSettingsSerializer, HeroSettingsSerializer, HeroSlideSerializer, MediaAssetSerializer, CompanyProfileSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user and request.user.is_authenticated
            and hasattr(request.user, 'role') and request.user.role == 'admin'
        )

class PromotionSettingsView(APIView):
    """GET /api/v1/settings/promotions/ — read or update the singleton promotion settings."""
    permission_classes = [IsAdminOrReadOnly]

    def get(self, request):
        settings = PromotionSettings.get()
        serializer = PromotionSettingsSerializer(settings)
        return Response(serializer.data)

    def patch(self, request):
        settings = PromotionSettings.get()
        serializer = PromotionSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class HeroSettingsView(APIView):
    """GET /api/v1/settings/hero/ — read or update the singleton hero settings."""
    permission_classes = [IsAdminOrReadOnly]

    def get(self, request):
        settings = HeroSettings.get()
        serializer = HeroSettingsSerializer(settings, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        settings = HeroSettings.get()
        serializer = HeroSettingsSerializer(settings, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class HeroSlideViewSet(viewsets.ModelViewSet):
    """CRUD for hero slides."""
    queryset = HeroSlide.objects.all()
    serializer_class = HeroSlideSerializer
    permission_classes = [IsAdminOrReadOnly]

class MediaAssetViewSet(viewsets.ModelViewSet):
    """CRUD for global media library."""
    queryset = MediaAsset.objects.all()
    serializer_class = MediaAssetSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def perform_create(self, serializer):
        file = self.request.data.get('file')
        file_type = ''
        if file:
            content_type = file.content_type
            if content_type.startswith('image/'):
                file_type = 'image'
            elif content_type.startswith('video/'):
                file_type = 'video'
        serializer.save(file_type=file_type)

class CompanyProfileView(APIView):
    """GET /api/v1/settings/company-profile/ — read or update the singleton company profile."""
    permission_classes = [IsAdminOrReadOnly]

    def get(self, request):
        profile = CompanyProfile.get()
        serializer = CompanyProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        profile = CompanyProfile.get()
        serializer = CompanyProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

