import { createClient } from "next-sanity";
import { NextResponse } from "next/server";

const client = createClient({
  projectId: "yqk7lu4g",
  dataset: "production",
  apiVersion: "2023-03-11",
  token: process.env.SANITY_TOKEN,
  useCdn: true,
});

export async function GET() {
  try {
    const [caseStudies, vegaTvData, aboutData, transData, songData] = await Promise.all([
      client.fetch(`*[_type == "caseStudies" && !(_id in path("drafts.**"))]{
        header,
        image {
          asset->{url, metadata},
          hotspot
        },
        featuredImage,
        body,
        projectBreakdown,
        portrait[]{
          asset->{_id, _type, url}
        },
        imageGallery1,
        body2,
        order,
        title,
        subtitle,
        services
      } | order(order asc)`),
      client.fetch('*[_type == "vegaTv"][0]'),
      client.fetch(`*[_type == "about"]{
        header,
        "logoUrl": logo.asset->url,
        imagesGallery,
        body,
        imagesGallery2[] {
          image {
            asset->,
            hotspot,
            crop
          },
          name,
          title
        },
        body2,
        skill1 {
          title,
          list
        },
        skill2 {
          title,
          list
        },
        skill3 {
          title,
          list
        }
      }`),
      client.fetch(`*[_type == "Gen-Synth"]{
        header,
        imagesGallery[] {
          asset->
        },
        body,
        videos[] {
          videoUrl,
          videoLink,
          thumbnail {
            asset->
          }
        },
        body2
      }`),
      client.fetch(`*[_type == "songData"]`)
    ]);

    return NextResponse.json({
      caseStudies,
      vegaTv: vegaTvData,
      about: aboutData,
      trans: transData,
      songData
    });
  } catch (error) {
    console.error('Sanity fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 