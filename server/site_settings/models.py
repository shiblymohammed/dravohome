from django.db import models
from offers.models import Offer

class MediaAsset(models.Model):
    """Global media library for reusable images and videos."""
    title = models.CharField(max_length=200, blank=True, default='')
    file = models.FileField(upload_to='media_library/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_type = models.CharField(max_length=50, blank=True, default='')

    class Meta:
        db_table = 'media_assets'
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.title or self.file.name
class PromotionSettings(models.Model):
    """Singleton model for site-wide promotion settings."""

    is_marquee_enabled = models.BooleanField(
        default=False,
        help_text="Enable the scrolling offer ticker above the navbar"
    )
    marquee_speed = models.IntegerField(
        default=40,
        help_text="Scrolling speed in seconds (lower = faster)"
    )
    marquee_offers = models.ManyToManyField(
        Offer,
        blank=True,
        related_name='marquee_settings',
        help_text="Active offers to display in the marquee ticker"
    )

    # Welcome Pop-up Settings
    is_popup_enabled = models.BooleanField(
        default=False,
        help_text="Enable the first-visit welcome offer pop-up"
    )
    
    POPUP_STRATEGIES = [
        ('single', 'Single Offer'),
        ('cycle_daily', 'Cycle Daily'),
        ('cycle_hourly', 'Cycle Hourly'),
    ]
    popup_strategy = models.CharField(
        max_length=20,
        choices=POPUP_STRATEGIES,
        default='single',
        help_text="How to cycle through multiple popup offers"
    )
    popup_offers = models.ManyToManyField(
        Offer,
        blank=True,
        related_name='popup_settings',
        help_text="Active offers to display in the welcome pop-up"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'promotion_settings'
        verbose_name = 'Promotion Settings'
        verbose_name_plural = 'Promotion Settings'

    def __str__(self):
        return f"Promotion Settings (Marquee: {'ON' if self.is_marquee_enabled else 'OFF'})"

    def save(self, *args, **kwargs):
        """Enforce singleton — only one instance allowed."""
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        """Get or create the singleton instance."""
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class BackupHistory(models.Model):
    """Tracks backup and restore operations."""

    ACTION_CHOICES = [
        ('backup', 'Backup'),
        ('restore', 'Restore'),
    ]
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('partial', 'Partial Success'),
        ('failed', 'Failed'),
    ]

    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='success')
    performed_by = models.CharField(max_length=200, blank=True, default='')
    filename = models.CharField(max_length=500, blank=True, default='')
    file_size = models.BigIntegerField(null=True, blank=True)
    strategy = models.CharField(max_length=20, blank=True, default='')
    records_created = models.IntegerField(default=0)
    records_overwritten = models.IntegerField(default=0)
    records_skipped = models.IntegerField(default=0)
    records_renamed = models.IntegerField(default=0)
    records_errors = models.IntegerField(default=0)
    total_records = models.IntegerField(default=0)
    error_message = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'backup_history'
        ordering = ['-created_at']
        verbose_name = 'Backup History'
        verbose_name_plural = 'Backup History'

    def __str__(self):
        return f"{self.get_action_display()} — {self.created_at.strftime('%Y-%m-%d %H:%M')}"

class HeroSlide(models.Model):
    image = models.ImageField(upload_to='hero_slides/', blank=True, null=True)
    subtitle = models.CharField(max_length=200, blank=True, default='')
    title = models.CharField(max_length=200, blank=True, default='')
    title_emphasized = models.CharField(max_length=200, blank=True, default='')
    description = models.TextField(blank=True, default='')
    cta1_text = models.CharField(max_length=100, blank=True, default='Shop Now')
    cta1_link = models.CharField(max_length=200, blank=True, default='/products')
    cta2_text = models.CharField(max_length=100, blank=True, default='View Lookbook')
    cta2_link = models.CharField(max_length=200, blank=True, default='/collections')
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'hero_slides'
        ordering = ['order']
        
    def __str__(self):
        return self.title or f"Slide {self.id}"

class HeroSettings(models.Model):
    HERO_TYPES = [
        ('carousel', 'Cinematic Carousel'),
        ('trending_grid', 'Trending Product Grid'),
        ('split_screen', 'Split Screen Collection'),
        ('minimal_video', 'Minimal Video Showcase'),
    ]
    active_type = models.CharField(max_length=20, choices=HERO_TYPES, default='carousel')

    # Shared or specific fields for non-carousel types
    primary_heading = models.CharField(max_length=200, blank=True, default='ELEVATE YOUR LIVING SPACE')
    secondary_heading = models.CharField(max_length=200, blank=True, default='Discover our new collection')
    description = models.TextField(blank=True, default='Experience the epitome of luxury with our hand-crafted, sustainably sourced furniture.')
    
    # Type: trending_grid / split_screen
    featured_products = models.ManyToManyField('products.Product', blank=True, related_name='featured_in_hero')
    featured_image = models.ImageField(upload_to='hero_featured/', blank=True, null=True)
    
    # Type: minimal_video
    background_video_url = models.URLField(blank=True, default='')
    
    # CTAs
    cta_text = models.CharField(max_length=100, blank=True, default='Shop Now')
    cta_link = models.CharField(max_length=200, blank=True, default='/products')

    class Meta:
        db_table = 'hero_settings'
        verbose_name = 'Hero Settings'
        verbose_name_plural = 'Hero Settings'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

class CompanyProfile(models.Model):
    name = models.CharField(max_length=200, default='Dravo Homes')
    tagline = models.CharField(max_length=300, blank=True, default='')
    about_text = models.TextField(blank=True, default='')
    mission = models.TextField(blank=True, default='')
    vision = models.TextField(blank=True, default='')
    hero_image = models.ImageField(upload_to='company/', blank=True, null=True)
    contact_email = models.EmailField(blank=True, default='')
    contact_phone = models.CharField(max_length=50, blank=True, default='')
    address = models.TextField(blank=True, default='')
    
    # social links
    instagram = models.URLField(blank=True, default='')
    facebook = models.URLField(blank=True, default='')
    linkedin = models.URLField(blank=True, default='')
    
    class Meta:
        db_table = 'company_profile'
        verbose_name = 'Company Profile'
        verbose_name_plural = 'Company Profile'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

