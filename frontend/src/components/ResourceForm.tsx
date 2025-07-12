// components/ResourceForm.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, X } from 'lucide-react';
import { api } from '@/lib/api';
import type { Resource } from '../../../shared/types';

interface ResourceFormProps {
  circleSlug: string;
  onSuccess: (resource: Resource) => void;
  onCancel: () => void;
}

const COMMON_CATEGORIES = [
  'Tools',
  'Garden Equipment',
  'Kitchen Appliances',
  'Electronics',
  'Sports Equipment',
  'Books & Media',
  'Transportation',
  'Cleaning Supplies',
  'Other'
];

export function ResourceForm({ circleSlug, onSuccess, onCancel }: ResourceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Resource name is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const finalCategory = category === 'custom' ? customCategory.trim() : category;

      const resource = await api.createResource(circleSlug, {
        name: name.trim(),
        description: description.trim() || undefined,
        category: finalCategory || undefined,
      });

      onSuccess(resource);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create resource');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Resource Name */}
      <div>
        <Label htmlFor="name">Resource Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Lawn Mower, Power Drill, Pasta Machine"
          required
          maxLength={100}
        />
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category (optional)" />
          </SelectTrigger>
          <SelectContent>
            {COMMON_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom...</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Category Input */}
      {category === 'custom' && (
        <div>
          <Label htmlFor="customCategory">Custom Category</Label>
          <Input
            id="customCategory"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="Enter custom category"
            maxLength={50}
          />
        </div>
      )}

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details about the resource, condition, usage notes, etc."
          rows={3}
          maxLength={500}
        />
        <div className="text-xs text-muted-foreground mt-1">
          {description.length}/500 characters
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isLoading}
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="flex-1"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isLoading ? 'Adding...' : 'Add Resource'}
        </Button>
      </div>
    </form>
  );
}