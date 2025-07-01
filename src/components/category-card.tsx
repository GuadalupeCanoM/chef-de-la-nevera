'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';

interface CategoryCardProps {
    name: string;
    slug: string;
    imageUrl: string;
    imageHint: string;
}

export function CategoryCard({ name, slug, imageUrl, imageHint }: CategoryCardProps) {
    return (
        <Link href={`/category/${slug}`} className="group block">
            <Card className="overflow-hidden relative aspect-square transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                <Image
                    src={imageUrl}
                    alt={`Imagen de la categoría ${name}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    data-ai-hint={imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-xl font-bold text-white shadow-lg">{name}</h3>
                </div>
            </Card>
        </Link>
    );
}
