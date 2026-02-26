import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Calendar, Plane, Hotel, Home } from 'lucide-react';
import type { Event } from '../backend';
import {
  generateSkyscannerUrl,
  generateBookingUrl,
  getOutboundDate,
  getReturnDate,
  timeToDate,
  formatBookingDate,
} from '../utils/travelLinks';

const HOME_CITY_KEY = 'tripPlannerHomeCity';

type BudgetLevel = 'budget' | 'mid' | 'luxury';

interface TripPlannerModalProps {
  event: Event;
  artistName: string;
  onClose: () => void;
}

const budgetOptions: { value: BudgetLevel; label: string; emoji: string; desc: string }[] = [
  { value: 'budget', label: 'Budget', emoji: '💸', desc: 'Hostels & low-cost carriers' },
  { value: 'mid', label: 'Mid-range', emoji: '✈️', desc: 'Hotels & standard flights' },
  { value: 'luxury', label: 'Luxury', emoji: '🥂', desc: 'Premium hotels & business class' },
];

export default function TripPlannerModal({ event, artistName, onClose }: TripPlannerModalProps) {
  const [homeCity, setHomeCity] = useState<string>(() => {
    return localStorage.getItem(HOME_CITY_KEY) ?? '';
  });
  const [budget, setBudget] = useState<BudgetLevel>('mid');

  // Persist home city to localStorage whenever it changes
  useEffect(() => {
    if (homeCity.trim()) {
      localStorage.setItem(HOME_CITY_KEY, homeCity.trim());
    }
  }, [homeCity]);

  const eventDate = timeToDate(event.dateTime);
  const outboundDate = getOutboundDate(event.dateTime);
  const returnDate = getReturnDate(event.dateTime);

  const skyscannerUrl = homeCity.trim()
    ? generateSkyscannerUrl(homeCity.trim(), event.city, outboundDate, returnDate)
    : null;

  const bookingUrl = generateBookingUrl(event.city, eventDate, returnDate);

  const budgetParam: Record<BudgetLevel, string> = {
    budget: 'economy',
    mid: 'economy',
    luxury: 'business',
  };

  const skyscannerWithCabin = skyscannerUrl
    ? `${skyscannerUrl}?cabin=${budgetParam[budget]}`
    : null;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg text-foreground flex items-center gap-2">
            <Plane className="w-5 h-5 text-neon-amber" />
            Plan Your Trip
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            <span className="text-neon-amber font-semibold">{artistName}</span>
            {' '}at{' '}
            <span className="text-foreground">{event.venue}</span>
            {', '}
            <span className="text-foreground">{event.city}, {event.country}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-5">
          {/* Event summary */}
          <div className="bg-background border border-border rounded p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <MapPin className="w-3.5 h-3.5 text-neon-amber shrink-0" />
              <span>{event.venue} · {event.city}, {event.country}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Calendar className="w-3.5 h-3.5 text-neon-amber shrink-0" />
              <span>
                {eventDate.toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Suggested travel dates */}
          <div className="bg-background border border-border rounded p-3">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Suggested Travel Dates
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Outbound</p>
                <p className="text-sm font-mono text-neon-amber">
                  {formatBookingDate(outboundDate)}
                </p>
                <p className="text-xs text-muted-foreground/60">Day before event</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Return</p>
                <p className="text-sm font-mono text-neon-amber">
                  {formatBookingDate(returnDate)}
                </p>
                <p className="text-xs text-muted-foreground/60">Day after event</p>
              </div>
            </div>
          </div>

          {/* Home city input */}
          <div className="space-y-1.5">
            <Label htmlFor="homeCity" className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" />
              Your Home City / Airport
            </Label>
            <Input
              id="homeCity"
              placeholder="e.g. London, New York, Berlin..."
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              className="bg-background border-border font-mono text-sm focus:border-neon-amber/60 focus:ring-neon-amber/20"
            />
            <p className="text-xs text-muted-foreground/60">
              Saved locally for future trips
            </p>
          </div>

          {/* Budget selector */}
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Budget Level
            </p>
            <div className="grid grid-cols-3 gap-2">
              {budgetOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBudget(opt.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded border text-center transition-all duration-200 ${
                    budget === opt.value
                      ? 'border-neon-amber bg-neon-amber/10 text-neon-amber'
                      : 'border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground'
                  }`}
                >
                  <span className="text-lg">{opt.emoji}</span>
                  <span className="text-xs font-semibold font-mono">{opt.label}</span>
                  <span className="text-[10px] leading-tight opacity-70">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-1">
            {/* Skyscanner */}
            <Button
              asChild={!!skyscannerWithCabin}
              disabled={!skyscannerWithCabin}
              className="w-full bg-neon-amber/10 text-neon-amber border border-neon-amber/40 hover:bg-neon-amber/20 hover:border-neon-amber/70 font-mono text-sm transition-all duration-200"
              variant="outline"
            >
              {skyscannerWithCabin ? (
                <a
                  href={skyscannerWithCabin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <Plane className="w-4 h-4" />
                  Search Flights on Skyscanner
                </a>
              ) : (
                <span className="flex items-center justify-center gap-2 opacity-50">
                  <Plane className="w-4 h-4" />
                  Enter home city to search flights
                </span>
              )}
            </Button>

            {/* Booking.com */}
            <Button
              asChild
              className="w-full bg-neon-green/10 text-neon-green border border-neon-green/40 hover:bg-neon-green/20 hover:border-neon-green/70 font-mono text-sm transition-all duration-200"
              variant="outline"
            >
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <Hotel className="w-4 h-4" />
                Search Hotels on Booking.com
              </a>
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground/50 text-center font-mono">
            Links open external sites. Prices shown on partner sites.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
