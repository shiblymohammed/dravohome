import io
import os
import base64
import qrcode
from django.http import FileResponse, Http404
from rest_framework import permissions, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Catalogue
from .serializers import CatalogueSerializer, CatalogueCreateSerializer, CatalogueUpdateSerializer


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated
                and hasattr(request.user, 'role') and request.user.role == 'admin')


# ── List / Create ────────────────────────────────────────────────────────────

class CatalogueListCreateView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        data = CatalogueSerializer(Catalogue.objects.all(), many=True, context={'request': request}).data
        return Response(data)

    def post(self, request):
        # Save name first (no PDF) so slug is generated, then attach PDF
        serializer = CatalogueCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': {'code': 'VALIDATION_ERROR', 'details': serializer.errors}},
                            status=status.HTTP_400_BAD_REQUEST)
        catalogue = serializer.save()
        pdf = request.FILES.get('pdf_file')
        if pdf:
            catalogue.pdf_file.save(f'{catalogue.slug}.pdf', pdf, save=True)
        return Response(CatalogueSerializer(catalogue, context={'request': request}).data,
                        status=status.HTTP_201_CREATED)


# ── Detail / Update / Delete ─────────────────────────────────────────────────

class CatalogueDetailView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def _get(self, pk):
        try:
            return Catalogue.objects.get(pk=pk)
        except Catalogue.DoesNotExist:
            return None

    def put(self, request, pk):
        obj = self._get(pk)
        if not obj:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = CatalogueUpdateSerializer(obj, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({'error': {'code': 'VALIDATION_ERROR', 'details': serializer.errors}},
                            status=status.HTTP_400_BAD_REQUEST)
        catalogue = serializer.save()
        pdf = request.FILES.get('pdf_file')
        if pdf:
            if catalogue.pdf_file:
                catalogue.pdf_file.delete(save=False)
            catalogue.pdf_file.save(f'{catalogue.slug}.pdf', pdf, save=True)
        return Response(CatalogueSerializer(catalogue, context={'request': request}).data)

    def delete(self, request, pk):
        obj = self._get(pk)
        if not obj:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if obj.pdf_file:
            obj.pdf_file.delete(save=False)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── QR Code ──────────────────────────────────────────────────────────────────

class CatalogueQRView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            catalogue = Catalogue.objects.get(pk=pk)
        except Catalogue.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        frontend_base = os.environ.get('FRONTEND_URL', 'https://dravohome.com')
        public_url = f'{frontend_base}/catalogue/{catalogue.slug}/'

        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(public_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color='black', back_color='white')

        buf = io.BytesIO()
        img.save(buf, format='PNG')
        buf.seek(0)
        b64 = base64.b64encode(buf.getvalue()).decode()

        return Response({
            'qr_code': f'data:image/png;base64,{b64}',
            'public_url': public_url,
        })


# ── Public page data (for user frontend) ─────────────────────────────────────

class CataloguePublicDataView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        try:
            catalogue = Catalogue.objects.get(slug=slug)
        except Catalogue.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        return Response({
            'name': catalogue.name,
            'pdf_url': request.build_absolute_uri(catalogue.pdf_file.url) if catalogue.pdf_file else None,
        })
