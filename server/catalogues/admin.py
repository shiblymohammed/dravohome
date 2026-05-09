from django.contrib import admin
from .models import Catalogue

@admin.register(Catalogue)
class CatalogueAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'pdf_file', 'created_at']
