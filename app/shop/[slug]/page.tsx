import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductOrderPanel } from "@/components/shop/product-order-panel";
import { ProductGallery } from "@/components/shop/product-gallery";
import { siteConfig } from "@/lib/constants";
import { getProductBySlug, getProducts } from "@/lib/data";
import { formatCurrency, getStartingPrice } from "@/utils/format";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const url = `${siteConfig.url}/shop/${product.slug}`;

  return {
    title: product.name,
    description: product.shortDescription,
    alternates: {
      canonical: url
    },
    openGraph: {
      title: `${product.name} | ${siteConfig.name}`,
      description: product.shortDescription,
      url,
      siteName: siteConfig.name,
      locale: "bn_BD",
      type: "website",
      images: product.images.length
        ? product.images.slice(0, 1)
        : [
            {
              url: "/og.svg",
              width: 1200,
              height: 630,
              alt: `${siteConfig.name} mango`
            }
          ]
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.shortDescription
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <section className="container-page grid gap-8 py-10 lg:grid-cols-[1.1fr_.9fr] lg:py-14">
      <ProductGallery images={product.images} name={product.name} />
      <div>
        <p className="text-sm font-semibold text-[#2E7D32]">Premium Harvest</p>
        <h1 className="mt-2 text-3xl font-bold text-[#17351a] sm:text-4xl">{product.name}</h1>
        <p className="mt-3 text-2xl font-bold text-[#1B5E20]">{formatCurrency(getStartingPrice(product))} থেকে</p>
        <p className="mt-5 leading-8 text-neutral-600">{product.description}</p>
        <div className="mt-6">
          <ProductOrderPanel product={product} />
        </div>
      </div>
    </section>
  );
}
