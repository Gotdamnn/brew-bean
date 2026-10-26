import 'server-only';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Drop real café photography into /public/photos/ using these names and it appears automatically:
 *   hero.jpg · welcome.jpg · about-1.jpg · about-2.jpg · about-3.jpg · specialties.jpg
 * (.jpg, .jpeg, .png or .webp). Until then, illustrated artwork is shown.
 */
export function photo(name: string): string | null {
  for (const ext of ['jpg', 'jpeg', 'webp', 'png']) {
    const rel = `/photos/${name}.${ext}`;
    if (existsSync(path.join(process.cwd(), 'public', rel))) return rel;
  }
  return null;
}
