import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 },
      );
    }

    // Call the Stable Diffusion integration
    const imageResponse = await fetch(
      `/integrations/stable-diffusion-v-3/?prompt=${encodeURIComponent(prompt)}&width=1024&height=1024`,
      {
        method: "GET",
      },
    );

    if (!imageResponse.ok) {
      console.error(
        "Stable Diffusion API error:",
        imageResponse.status,
        imageResponse.statusText,
      );
      return Response.json(
        { error: "Failed to generate image" },
        { status: 500 },
      );
    }

    const imageData = await imageResponse.json();

    if (!imageData.data || !imageData.data[0]) {
      console.error("Invalid response from Stable Diffusion:", imageData);
      return Response.json({ error: "No image generated" }, { status: 500 });
    }

    const imageUrl = imageData.data[0];

    // Save the generated image to the database
    try {
      const [savedImage] = await sql`
        INSERT INTO generated_images (prompt, image_url, width, height, user_id)
        VALUES (${prompt}, ${imageUrl}, 1024, 1024, 'anonymous')
        RETURNING 
          id,
          prompt,
          image_url,
          width,
          height,
          created_at,
          user_id
      `;

      return Response.json({
        imageUrl,
        prompt,
        timestamp: savedImage.created_at,
        id: savedImage.id,
      });
    } catch (dbError) {
      console.error("Database save error:", dbError);
      // Still return the generated image even if database save fails
      return Response.json({
        imageUrl,
        prompt,
        timestamp: new Date().toISOString(),
        warning: "Image generated but not saved to history",
      });
    }
  } catch (error) {
    console.error("Image generation error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
