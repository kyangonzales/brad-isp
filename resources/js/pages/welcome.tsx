import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Ulyces ISP" />
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* 🔝 Navigation */}
                <header className="border-border/40 w-full border-b backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Ulyces<span className="text-[#1C3694]">ISP</span>
                        </h1>
                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <Link href={route('dashboard')}>
                                    <Button
                                        variant="outline"
                                        className="border-[#1C3694] text-[#1C3694] transition hover:bg-[#1C3694] hover:text-white"
                                    >
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')}>
                                        <Button variant="ghost" className="hover:text-[#1C3694]">
                                            Log in
                                        </Button>
                                    </Link>
                                    <Link href={route('register')}>
                                        <Button className="bg-[#1C3694] text-white transition hover:bg-[#162B75]">Register</Button>
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* 🏠 Hero Section */}
                <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
                        <h2 className="text-4xl leading-tight font-bold sm:text-5xl md:text-6xl">
                            Fast, Reliable, and Affordable
                            <br />
                            <span className="text-[#1C3694]">Internet Solutions</span>
                        </h2>
                        <p className="text-muted-foreground mt-4 text-lg">
                            Experience seamless connectivity with Ulyces ISP — bringing high-speed internet to your home and business.
                        </p>

                        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link href={route('register')}>
                                <Button size="lg" className="gap-2 bg-[#1C3694] text-white transition hover:bg-[#162B75]">
                                    Get Started <ChevronRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </main>
                <section className="bg-muted/20 w-full py-20">
                    <div className="mx-auto max-w-6xl px-6">
                        <h3 className="mb-12 text-center text-3xl font-bold text-[#1C3694]">Our Plans</h3>
                        <div className="grid gap-8 md:grid-cols-3">
                            {[
                                { name: 'Basic Plan', price: '₱699/mo', desc: 'Perfect for light browsing and social media.' },
                                { name: 'Standard Plan', price: '₱999/mo', desc: 'Ideal for streaming, online classes, and work from home.' },
                                { name: 'Premium Plan', price: '₱1499/mo', desc: 'Best for heavy use, gaming, and multiple devices.' },
                            ].map((plan, idx) => (
                                <Card key={idx} className="shadow-md transition hover:shadow-lg">
                                    <CardContent className="p-6 text-center">
                                        <h4 className="mb-2 text-2xl font-semibold text-[#1C3694]">{plan.name}</h4>
                                        <p className="mb-4 text-3xl font-bold">{plan.price}</p>
                                        <p className="text-muted-foreground">{plan.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 📶 Features Section */}
                <section className="border-border/40 bg-muted/20 w-full border-t py-20">
                    <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-2 md:grid-cols-3">
                        {[
                            { title: 'Ultra-Fast Speeds', desc: 'Enjoy blazing fast internet for work, streaming, and gaming.' },
                            { title: '24/7 Support', desc: 'Our dedicated team is here to help you anytime.' },
                            { title: 'Affordable Plans', desc: 'Choose from flexible packages that fit your needs and budget.' },
                        ].map((feature, idx) => (
                            <Card key={idx} className="shadow-sm transition-shadow hover:shadow-lg">
                                <CardContent className="p-6 text-center">
                                    <h3 className="mb-2 text-xl font-semibold text-[#1C3694]">{feature.title}</h3>
                                    <p className="text-muted-foreground text-sm">{feature.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* 📍 Footer */}
                <footer className="border-border/40 text-muted-foreground border-t py-6 text-center text-sm">
                    © {new Date().getFullYear()} Ulyces ISP. All rights reserved.
                </footer>
            </div>
        </>
    );
}
