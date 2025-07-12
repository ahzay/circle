// components/ClaimModal.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarDays, Repeat } from 'lucide-react';
import { api } from '@/lib/api';
import type { Resource, Claim } from '../../../shared/types';

interface ClaimModalProps {
    resource: Resource;
    existingClaims: Claim[];
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ClaimModal({
    resource,
    existingClaims,
    isOpen,
    onClose,
    onSuccess
}: ClaimModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('17:00');
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringPattern, setRecurringPattern] = useState<'weekly' | 'monthly'>('weekly');
    const [notes, setNotes] = useState('');

    // Set default dates to today and tomorrow
    React.useEffect(() => {
        if (isOpen && !startDate) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            setStartDate(today.toISOString().split('T')[0]);
            setEndDate(tomorrow.toISOString().split('T')[0]);
        }
    }, [isOpen, startDate]);

    const formatDateTime = (date: string, time: string): string => {
        return `${date}T${time}:00.000Z`;
    };

    const hasConflict = (): boolean => {
        const proposedStart = new Date(formatDateTime(startDate, startTime));
        const proposedEnd = new Date(formatDateTime(endDate, endTime));

        return existingClaims.some(claim => {
            if (claim.status !== 'active') return false;

            const claimStart = new Date(claim.start_time);
            const claimEnd = new Date(claim.end_time);

            // Check for overlap
            return proposedStart < claimEnd && proposedEnd > claimStart;
        });
    };

    const validateForm = (): string | null => {
        if (!startDate || !startTime || !endDate || !endTime) {
            return 'Please fill in all date and time fields';
        }

        const start = new Date(formatDateTime(startDate, startTime));
        const end = new Date(formatDateTime(endDate, endTime));
        const now = new Date();


        if (end <= start) {
            return 'End time must be after start time';
        }

        if (hasConflict()) {
            return 'This time period conflicts with an existing claim';
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            await api.createClaim(resource.id, {
                start_time: formatDateTime(startDate, startTime),
                end_time: formatDateTime(endDate, endTime),
                is_recurring: isRecurring,
                recurring_pattern: isRecurring ? recurringPattern : undefined,
                notes: notes.trim() || undefined,
            });

            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create claim');
        } finally {
            setIsLoading(false);
        }
    };

    const getConflictingClaims = () => {
        if (!startDate || !startTime || !endDate || !endTime) return [];

        const proposedStart = new Date(formatDateTime(startDate, startTime));
        const proposedEnd = new Date(formatDateTime(endDate, endTime));

        return existingClaims.filter(claim => {
            if (claim.status !== 'active') return false;

            const claimStart = new Date(claim.start_time);
            const claimEnd = new Date(claim.end_time);

            return proposedStart < claimEnd && proposedEnd > claimStart;
        });
    };

    const conflictingClaims = getConflictingClaims();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" />
                        Claim "{resource.name}"
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Start Date & Time */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* End Date & Time */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                                id="endTime"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Recurring options */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="recurring"
                                checked={isRecurring}
                                onCheckedChange={(checked) => setIsRecurring(checked === true)}
                            />
                            <Label htmlFor="recurring" className="flex items-center gap-1">
                                <Repeat className="h-4 w-4" />
                                Make this recurring
                            </Label>
                        </div>

                        {isRecurring && (
                            <div>
                                <Label htmlFor="recurringPattern">Repeat every:</Label>
                                <Select
                                    value={recurringPattern}
                                    onValueChange={(value: 'weekly' | 'monthly') => setRecurringPattern(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">Week</SelectItem>
                                        <SelectItem value="monthly">Month</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any additional details about your usage..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Conflict warnings */}
                    {conflictingClaims.length > 0 && (
                        <Alert>
                            <AlertDescription>
                                <div className="space-y-1">
                                    <div className="font-medium">Time conflict detected:</div>
                                    {conflictingClaims.map((claim) => (
                                        <div key={claim.id} className="text-sm">
                                            {new Date(claim.start_time).toLocaleDateString()} - {new Date(claim.end_time).toLocaleDateString()}
                                        </div>
                                    ))}
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || conflictingClaims.length > 0}
                            className="flex-1"
                        >
                            {isLoading ? 'Creating...' : 'Claim Resource'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}