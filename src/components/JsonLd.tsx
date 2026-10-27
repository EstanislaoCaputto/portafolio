import { useEffect } from 'react';
import { serializeJsonLd } from '../lib/jsonld';

const SCRIPT_ID = 'portfolio-jsonld';

/**
 * Publica los datos del portafolio como schema.org `Person`. Los lectores
 * automáticos (incluidos los de selección de personal) lo interpretan sin
 * depender del render visual.
 */
export function JsonLd({ data }: { data: unknown }) {
  useEffect(() => {
    const script = document.getElementById(SCRIPT_ID) ?? document.createElement('script');

    script.id = SCRIPT_ID;
    script.setAttribute('type', 'application/ld+json');
    script.textContent = serializeJsonLd(data);

    if (!script.isConnected) document.head.append(script);
  }, [data]);

  return null;
}
