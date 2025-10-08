import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

interface CustomerImagesProps {
    images: string[] | string | null;
}

export default function CustomerImagesCard({ images }: CustomerImagesProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const imageArray: string[] = Array.isArray(images) ? images : images ? [images] : [];

    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">Home Picture</CardTitle>
                <CardDescription>Picture of the customer's home.</CardDescription>
            </CardHeader>

            <CardContent>
                {imageArray.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {imageArray.map((img, index) => (
                            <div key={index} className="group cursor-pointer" onClick={() => setSelectedImage(img)}>
                                <Card className="overflow-hidden rounded-lg transition hover:shadow-md">
                                    <CardContent className="flex items-center justify-center p-2">
                                        <img
                                            src={img}
                                            alt={`Customer Image ${index + 1}`}
                                            className="h-28 w-full rounded-md object-cover transition-transform group-hover:scale-105"
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 italic">No images uploaded.</div>
                )}
            </CardContent>

            {/* 📸 Preview Dialog */}
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>📷 Preview Image</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center">
                        <img src={selectedImage ?? ''} alt="Full Preview" className="max-h-[80vh] w-auto rounded-lg shadow-lg" />
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
