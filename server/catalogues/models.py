from django.db import models
from django.utils.text import slugify


def catalogue_pdf_path(instance, filename):
    # Always stored as catalogues/pdfs/<slug>.pdf — no original filename exposed
    return f'catalogues/pdfs/{instance.slug}.pdf'


class Catalogue(models.Model):
    """A catalogue page with a stable slug/URL and one replaceable PDF."""
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, db_index=True)
    pdf_file = models.FileField(upload_to=catalogue_pdf_path, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'catalogues'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name)
            slug = base
            n = 1
            while Catalogue.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{n}'
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)
