import sql from '@/app/api/utils/sql';

// Get all generated images
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const userId = searchParams.get('userId') || 'anonymous';

    const images = await sql`
      SELECT 
        id,
        prompt,
        image_url,
        width,
        height,
        created_at,
        user_id
      FROM generated_images 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC 
      LIMIT ${limit} 
      OFFSET ${offset}
    `;

    return Response.json({ images });
  } catch (error) {
    console.error('Error fetching images:', error);
    return Response.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// Save a new generated image
export async function POST(request) {
  try {
    const { prompt, image_url, width = 1024, height = 1024, user_id = 'anonymous' } = await request.json();

    if (!prompt || !image_url) {
      return Response.json(
        { error: 'Prompt and image_url are required' },
        { status: 400 }
      );
    }

    const [newImage] = await sql`
      INSERT INTO generated_images (prompt, image_url, width, height, user_id)
      VALUES (${prompt}, ${image_url}, ${width}, ${height}, ${user_id})
      RETURNING 
        id,
        prompt,
        image_url,
        width,
        height,
        created_at,
        user_id
    `;

    return Response.json({ image: newImage });
  } catch (error) {
    console.error('Error saving image:', error);
    return Response.json(
      { error: 'Failed to save image' },
      { status: 500 }
    );
  }
}