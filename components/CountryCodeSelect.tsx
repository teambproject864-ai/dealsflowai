"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming we have a cn utility

const countries = [
  { code: "+1", name: "United States" },
  { code: "+44", name: "United Kingdom" },
  { code: "+49", name: "Germany" },
  { code: "+33", name: "France" },
  { code: "+86", name: "China" },
  { code: "+91", name: "India" },
  { code: "+81", name: "Japan" },
  { code: "+82", name: "South Korea" },
  { code: "+61", name: "Australia" },
  { code: "+7", name: "Russia" },
  { code: "+55", name: "Brazil" },
  { code: "+52", name: "Mexico" },
  { code: "+34", name: "Spain" },
  { code: "+39", name: "Italy" },
  { code: "+31", name: "Netherlands" },
  { code: "+46", name: "Sweden" },
  { code: "+47", name: "Norway" },
  { code: "+41", name: "Switzerland" },
  { code: "+43", name: "Austria" },
  { code: "+32", name: "Belgium" },
  { code: "+351", name: "Portugal" },
  { code: "+30", name: "Greece" },
  { code: "+65", name: "Singapore" },
  { code: "+852", name: "Hong Kong" },
  { code: "+886", name: "Taiwan" },
  { code: "+63", name: "Philippines" },
  { code: "+66", name: "Thailand" },
  { code: "+60", name: "Malaysia" },
  { code: "+62", name: "Indonesia" },
  { code: "+966", name: "Saudi Arabia" },
  { code: "+971", name: "United Arab Emirates" },
  { code: "+20", name: "Egypt" },
  { code: "+27", name: "South Africa" },
  { code: "+234", name: "Nigeria" },
  { code: "+254", name: "Kenya" },
  { code: "+54", name: "Argentina" },
  { code: "+56", name: "Chile" },
  { code: "+57", name: "Colombia" },
  { code: "+58", name: "Venezuela" },
  { code: "+51", name: "Peru" },
];

export function CountryCodeSelect({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search)
  );

  const selectedCountry = countries.find((c) => c.code === value);

  return (
    <div className="space-y-2">
      <Label>Country Code</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCountry ? `${selectedCountry.code} ${selectedCountry.name}` : "Select country code"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <div className="p-2">
            <Input
              placeholder="Search country or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="p-2 text-center text-sm text-muted-foreground">No countries found</div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    onChange(country.code);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full text-left px-2 py-1.5 text-sm flex items-center justify-between hover:bg-accent",
                    value === country.code && "bg-accent"
                  )}
                >
                  <span>{country.code} {country.name}</span>
                  {value === country.code && <Check className="h-4 w-4" />}
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
