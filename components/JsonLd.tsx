// Rendert een JSON-LD <script> voor structured data (schema.org).
// Server-side gerenderd, zodat zoekmachines het direct zien.
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Vaste, door onszelf opgestelde data — geen gebruikersinvoer.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
