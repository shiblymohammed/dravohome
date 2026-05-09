import os
from rest_framework import serializers
from .models import Catalogue


class CatalogueSerializer(serializers.ModelSerializer):
    pdf_url = serializers.SerializerMethodField()
    public_url = serializers.SerializerMethodField()

    class Meta:
        model = Catalogue
        fields = ['id', 'name', 'slug', 'pdf_url', 'public_url', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'pdf_url', 'public_url', 'created_at', 'updated_at']

    def get_pdf_url(self, obj):
        request = self.context.get('request')
        if obj.pdf_file and request:
            return request.build_absolute_uri(obj.pdf_file.url)
        return None

    def get_public_url(self, obj):
        frontend_base = os.environ.get('FRONTEND_URL', 'https://dravohome.com')
        return f'{frontend_base}/catalogue/{obj.slug}/'


class CatalogueCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Catalogue
        fields = ['name']


class CatalogueUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Catalogue
        fields = ['name']
        extra_kwargs = {'name': {'required': False}}
