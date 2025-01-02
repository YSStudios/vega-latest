import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

const client = createClient({
  projectId: "yqk7lu4g",
  dataset: "production",
  apiVersion: "2023-03-11",
  token: process.env.SANITY_TOKEN,
  useCdn: true,
});

const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);

export default async function handler(req, res) {
  try {
    const [caseStudies, vegaTvData, about, trans, songData] = await Promise.all(
      [
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
        order,s
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
        client.fetch(`*[_type == "song"] {
        _id,
        _createdAt,
        _updatedAt,
        name,
        artist,
        cover,
        audio,
        color[]{
          _key,
          _type,
          alpha,
          hex,
          hsl->{
            _type,
            h,
            s,
            l,
            a
          },
          hsv->{
            _type,
            h,
            s,
            v,
            a
          },
          rgb->{
            _type,
            r,
            g,
            b,
            a
          }
        },
        active
      }`),
      ]
    );

    res.status(200).json({ caseStudies, vegaTvData, about, trans, songData });
  } catch (error) {
    console.error("Error fetching data from Sanity:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
