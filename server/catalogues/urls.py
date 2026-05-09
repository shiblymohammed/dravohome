from django.urls import path
from .views import CatalogueListCreateView, CatalogueDetailView, CatalogueQRView, CataloguePublicDataView

app_name = 'catalogues'

urlpatterns = [
    path('catalogues/', CatalogueListCreateView.as_view(), name='catalogue-list'),
    path('catalogues/<int:pk>/', CatalogueDetailView.as_view(), name='catalogue-detail'),
    path('catalogues/<int:pk>/qr/', CatalogueQRView.as_view(), name='catalogue-qr'),
    # Public — no auth required
    path('catalogues/<slug:slug>/data/', CataloguePublicDataView.as_view(), name='catalogue-public-data'),
]
