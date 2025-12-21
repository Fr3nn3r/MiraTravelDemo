'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductConfig } from '@/lib/engine/types';

interface ProductTemplate {
  id: string;
  name: string;
  description: string;
  region: string;
  config: ProductConfig;
}

interface NewProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated: (productId: string) => void;
}

export function NewProductDialog({
  open,
  onOpenChange,
  onProductCreated,
}: NewProductDialogProps) {
  const [step, setStep] = useState<'template' | 'details'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ProductTemplate | null>(null);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch('/api/products/templates');
        const data = await res.json();
        if (data.success) {
          setTemplates(data.templates);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    }
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const handleSelectTemplate = (template: ProductTemplate) => {
    setSelectedTemplate(template);
    setProductName(`${template.name} - New`);
    setProductDescription(template.description);
    setStep('details');
  };

  const handleCreate = async () => {
    if (!selectedTemplate || !productName.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          name: productName.trim(),
          description: productDescription.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.product) {
        onProductCreated(data.product.id);
        handleClose();
      }
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setStep('template');
    setSelectedTemplate(null);
    setProductName('');
    setProductDescription('');
    onOpenChange(false);
  };

  const handleBack = () => {
    setStep('template');
    setSelectedTemplate(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === 'template' ? 'Select a Template' : 'Product Details'}
          </DialogTitle>
          <DialogDescription>
            {step === 'template'
              ? 'Choose a template to start with. You can customize all settings after creation.'
              : 'Enter the name and description for your new product.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'template' ? (
          <div className="grid gap-3 py-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
                onClick={() => handleSelectTemplate(template)}
                data-testid={`template-card-${template.id}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge variant="outline">{template.region}</Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{template.config.payoutTiers.length} payout tiers</span>
                    <span>
                      {template.config.exclusions.filter((e) => e.enabled).length} exclusions
                    </span>
                    <span>{template.config.eligibility.claimWindowHours}h claim window</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-description">Description</Label>
              <Input
                id="product-description"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Enter product description"
              />
            </div>
            {selectedTemplate && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-sm font-medium">Template: {selectedTemplate.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Starting with {selectedTemplate.config.payoutTiers.length} payout tiers,{' '}
                  {selectedTemplate.config.eligibility.claimWindowHours}h claim window
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'details' && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === 'details' && (
            <Button onClick={handleCreate} disabled={!productName.trim() || isCreating} data-testid="create-product-button">
              {isCreating ? 'Creating...' : 'Create Product'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
