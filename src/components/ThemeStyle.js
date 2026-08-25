import { themeToCss, googleFontsUrl } from "@/lib/theme";

export default function ThemeStyle({ theme }) {
  const css = themeToCss(theme);
  const fontsUrl = googleFontsUrl(theme);
  return (
    <>
      <style
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `@import url('${fontsUrl}');${css}`,
        }}
      />
    </>
  );
}
