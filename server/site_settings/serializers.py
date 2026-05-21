from rest_framework import serializers
from .models import PromotionSettings, HeroSlide, HeroSettings, MediaAsset, CompanyProfile
from offers.models import Offer
from products.models import Product

class MediaAssetSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    
    class Meta:
        model = MediaAsset
        fields = ['id', 'title', 'file', 'url', 'uploaded_at', 'file_type']
        
    def get_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

class MarqueeOfferSerializer(serializers.ModelSerializer):
    """Lightweight offer serializer for the marquee ticker."""
    class Meta:
        model = Offer
        fields = ['id', 'name', 'description', 'discount_percentage', 'image_url']

class PromotionSettingsSerializer(serializers.ModelSerializer):
    """Serializer for PromotionSettings — used for both GET and PATCH."""
    marquee_offers_detail = MarqueeOfferSerializer(
        source='marquee_offers', many=True, read_only=True
    )
    marquee_offers = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Offer.objects.all(),
        required=False
    )
    
    popup_offers_detail = MarqueeOfferSerializer(
        source='popup_offers', many=True, read_only=True
    )
    popup_offers = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Offer.objects.all(),
        required=False
    )

    class Meta:
        model = PromotionSettings
        fields = [
            'id', 'is_marquee_enabled', 'marquee_speed',
            'marquee_offers', 'marquee_offers_detail',
            'is_popup_enabled', 'popup_strategy',
            'popup_offers', 'popup_offers_detail',
            'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']

class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = '__all__'

class HeroProductSerializer(serializers.ModelSerializer):
    """Lightweight product serializer for hero section."""
    selling_price = serializers.SerializerMethodField()
    mrp = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'selling_price', 'mrp', 'description']

    def get_selling_price(self, obj):
        active_variants = [v for v in obj.variants.all() if v.is_active]
        default_variant = next((v for v in active_variants if v.is_default), None)
        if not default_variant and active_variants:
            default_variant = active_variants[0]
        return default_variant.price if default_variant else 0

    def get_mrp(self, obj):
        active_variants = [v for v in obj.variants.all() if v.is_active]
        default_variant = next((v for v in active_variants if v.is_default), None)
        if not default_variant and active_variants:
            default_variant = active_variants[0]
        return default_variant.mrp if default_variant else 0
        
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        active_variants = [v for v in instance.variants.all() if v.is_active]
        default_variant = next((v for v in active_variants if v.is_default), None)
        if not default_variant and active_variants:
            default_variant = active_variants[0]
        
        if default_variant and default_variant.images and len(default_variant.images) > 0:
            first_image = default_variant.images[0]
            ret['image'] = first_image.get('url') if isinstance(first_image, dict) else first_image
        else:
            ret['image'] = None
            
        return ret

class HeroSettingsSerializer(serializers.ModelSerializer):
    slides = serializers.SerializerMethodField()
    featured_products_detail = HeroProductSerializer(source='featured_products', many=True, read_only=True)
    featured_products = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Product.objects.all(),
        required=False
    )

    class Meta:
        model = HeroSettings
        fields = '__all__'

    def get_slides(self, obj):
        slides = HeroSlide.objects.filter(is_active=True).order_by('order')
        return HeroSlideSerializer(slides, many=True, context=self.context).data

class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProfile
        fields = '__all__'

