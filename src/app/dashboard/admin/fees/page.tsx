"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { suggestServiceFee, AdminServiceFeeSuggesterOutput } from '@/ai/flows/admin-service-fee-suggester';
import { Sparkles, Loader2, MapPin, TrafficCone, Info, Scale } from 'lucide-react';

export default function FeeSuggesterPage() {
  const [distance, setDistance] = useState<string>('1');
  const [feeCategory, setFeeCategory] = useState<'normal' | 'ekstra'>('normal');
  const [traffic, setTraffic] = useState<'low' | 'medium' | 'high' | 'very high'>('medium');
  const [params, setParams] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AdminServiceFeeSuggesterOutput | null>(null);

  const manualFee = useMemo(() => {
    const dist = Math.max(1, parseFloat(distance) || 0);
    const rates = { normal: 10000, ekstra: 15000 };
    return Math.ceil(dist * rates[feeCategory]);
  }, [distance, feeCategory]);

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const result = await suggestServiceFee({
        distance: parseFloat(distance),
        potentialTraffic: traffic,
        configurableParameters: `Layanan: ${feeCategory.toUpperCase()}. ${params}`
      });
      setSuggestion(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 overflow-x-hidden p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-3xl font-bold tracking-tight font-headline text-primary uppercase italic">Kebijakan Tarif Jasa</h1>
        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-70">Standarisasi Ongkir Jastip Siau Terbaru.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-8">
        <Card className="border-primary/10 shadow-xl rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="p-6 border-b bg-primary/[0.03]">
            <CardTitle className="text-lg font-black uppercase text-primary tracking-tight flex items-center gap-2">
              <Scale className="h-5 w-5" /> Simulator Tarif
            </CardTitle>
            <CardDescription className="text-[9px] font-bold uppercase tracking-widest">Uji biaya berdasarkan jarak & paket.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distance" className="text-[10px] font-black uppercase text-primary ml-1">Jarak (KM)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                  <Input 
                    id="distance" 
                    type="number" 
                    className="pl-10 h-12 text-sm font-black bg-muted/20 border-none rounded-xl"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-primary ml-1">Paket Jasa</Label>
                <Select value={feeCategory} onValueChange={(val: any) => setFeeCategory(val)}>
                  <SelectTrigger className="h-12 text-[10px] font-black uppercase bg-muted/20 border-none rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    <SelectItem value="normal" className="text-[10px] font-black uppercase">Normal (10k)</SelectItem>
                    <SelectItem value="ekstra" className="text-[10px] font-black uppercase text-blue-600">Ekstra (15k)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-6 bg-primary/[0.03] rounded-[1.8rem] border-2 border-dashed border-primary/10 flex flex-col items-center justify-center text-center space-y-1">
               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Estimasi Tarif Baru</p>
               <h3 className="text-3xl font-black text-primary tracking-tighter">Rp{manualFee.toLocaleString()}</h3>
               <p className="text-[8px] text-primary/40 mt-1 uppercase font-bold italic">Tarif Dasar: Rp{feeCategory === 'normal' ? '10.000' : '15.000'} / KM</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="traffic" className="text-[10px] font-black uppercase text-primary ml-1">Faktor Kondisi Medan</Label>
              <Select value={traffic} onValueChange={(val: any) => setTraffic(val)}>
                <SelectTrigger className="w-full h-12 text-[10px] font-black uppercase bg-muted/20 border-none rounded-xl">
                  <TrafficCone className="mr-2 h-4 w-4 text-orange-600" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                  <SelectItem value="low" className="text-[10px] font-black uppercase">Lancar (Aman)</SelectItem>
                  <SelectItem value="medium" className="text-[10px] font-black uppercase">Sedang</SelectItem>
                  <SelectItem value="high" className="text-[10px] font-black uppercase">Padat / Hujan</SelectItem>
                  <SelectItem value="very high" className="text-[10px] font-black uppercase">Sangat Macet / Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="p-6 bg-muted/5 border-t">
            <Button onClick={handleSuggest} disabled={loading} className="w-full h-14 text-xs font-black uppercase bg-primary shadow-xl rounded-2xl active:scale-95 transition-all gap-2">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              Analisis Strategis AI
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-4">
          {suggestion ? (
            <Card className="border-none bg-accent/5 animate-in fade-in zoom-in-95 duration-500 rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-accent/20">
              <CardHeader className="p-6 bg-accent/10 border-b border-accent/10">
                <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-widest">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                  <span>Rekomendasi Kebijakan AI</span>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="p-8 bg-white rounded-3xl border border-accent/10 flex flex-col items-center justify-center text-center shadow-inner">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mb-3">Biaya Jasa Disarankan</p>
                  <h3 className="text-5xl font-black text-primary tracking-tighter">
                    Rp{suggestion.suggestedFee.toLocaleString()}
                  </h3>
                </div>
                <div className="p-5 bg-white/50 rounded-2xl border-2 border-dashed border-accent/20">
                  <h4 className="font-black flex items-center gap-2 mb-3 text-[11px] uppercase text-primary tracking-widest">
                    <Info className="h-4 w-4" /> Justifikasi Logistik:
                  </h4>
                  <p className="text-[12px] text-primary/80 leading-relaxed italic font-bold uppercase tracking-tight">
                    "{suggestion.justification}"
                  </p>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button variant="outline" className="w-full h-12 text-[10px] font-black uppercase border-primary/20 bg-white rounded-xl shadow-sm">Terapkan Sebagai Standar</Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center border-4 border-dashed rounded-[3rem] bg-muted/20 opacity-40">
              <Sparkles className="h-16 w-16 text-primary mb-6" />
              <h3 className="font-black text-sm text-primary uppercase tracking-[0.3em]">Radar Analisis AI</h3>
              <p className="text-[10px] text-muted-foreground mt-4 max-w-[240px] font-bold uppercase tracking-tight leading-relaxed">Gunakan tombol Analisis AI untuk mendapatkan kalkulasi harga yang adil bagi Warga & Mitra.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
