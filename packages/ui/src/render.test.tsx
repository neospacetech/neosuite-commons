import type { Breakpoint } from "@neospacetech/neosuite-tokens";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  AdaptiveLayout,
  AdaptivePanel,
  Button,
  DataView,
  ListDetail,
  NavShell,
  Text,
  TextField,
  ThemeProvider,
} from "./index";

const items = [
  { key: "inbox", label: "Inbox", badge: 3 },
  { key: "tasks", label: "Tasks" },
];

function shell(breakpoint: Breakpoint) {
  return renderToStaticMarkup(
    <ThemeProvider theme="light">
      <NavShell items={items} activeKey="inbox" onSelect={() => {}} breakpoint={breakpoint}>
        <Text headingLevel={1}>Inbox</Text>
      </NavShell>
    </ThemeProvider>,
  );
}

describe("components render on react-native-web", () => {
  it("NavShell renders navigation, tabs and main content in every mode", () => {
    for (const bp of ["compact", "medium", "expanded", "tv"] as const) {
      const html = shell(bp);
      expect(html).toContain('role="navigation"');
      expect(html).toContain('role="tablist"');
      expect(html).toContain('aria-selected="true"');
      expect(html).toContain("<h1");
    }
    // Bottom tabs come after the content; rail and sidebar come before it.
    const compact = shell("compact");
    expect(compact.indexOf('role="main"')).toBeLessThan(compact.indexOf('role="navigation"'));
    const expanded = shell("expanded");
    expect(expanded.indexOf('role="navigation"')).toBeLessThan(expanded.indexOf('role="main"'));
  });

  it("Button exposes role, name and disabled state", () => {
    const html = renderToStaticMarkup(<Button label="Save" disabled onPress={() => {}} />);
    expect(html).toContain('role="button"');
    expect(html).toContain('aria-label="Save"');
    expect(html).toContain('aria-disabled="true"');
  });

  it("TextField links its label and announces errors", () => {
    const html = renderToStaticMarkup(<TextField label="Email" error="Required" value="" onChangeText={() => {}} />);
    expect(html).toMatch(/aria-labelledby="[^"]+-label"/);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('role="alert"');
  });

  it("ListDetail keeps both panes mounted and hides the inactive one on compact", () => {
    const render = (bp: Breakpoint) =>
      renderToStaticMarkup(
        <ListDetail
          breakpoint={bp}
          defaultSelectedId="a"
          renderList={() => <Text>LIST</Text>}
          renderDetail={({ selectedId }) => <Text>DETAIL {selectedId}</Text>}
        />,
      );
    const compact = render("compact");
    expect(compact).toContain("LIST");
    expect(compact).toContain("DETAIL a");
    expect(compact).toContain('aria-label="Back"');
    expect(render("medium")).not.toContain('aria-label="Back"');
  });

  it("AdaptivePanel is a dialog on compact and complementary otherwise", () => {
    const render = (bp: Breakpoint) =>
      renderToStaticMarkup(
        <AdaptivePanel open onClose={() => {}} title="NeoMind" panel={<Text>chat</Text>} breakpoint={bp}>
          <Text>main</Text>
        </AdaptivePanel>,
      );
    expect(render("compact")).toContain('role="dialog"');
    expect(render("expanded")).toContain('role="complementary"');
  });

  it("DataView switches between cards and a table", () => {
    const rows = [{ id: "1", name: "Ship it", owner: "Ana" }];
    const columns = [
      { key: "name", header: "Name", value: (r: (typeof rows)[number]) => r.name, primary: true },
      { key: "owner", header: "Owner", value: (r: (typeof rows)[number]) => r.owner },
    ];
    const render = (bp: Breakpoint) =>
      renderToStaticMarkup(
        <DataView data={rows} columns={columns} keyExtractor={(r) => r.id} accessibilityLabel="Tasks" breakpoint={bp} />,
      );
    expect(render("compact")).toContain('role="list"');
    const table = render("large");
    expect(table).toContain('role="table"');
    expect(table).toContain('role="columnheader"');
    expect(table).toContain("Ship it");
  });

  it("AdaptiveLayout picks the slot for the breakpoint", () => {
    const html = renderToStaticMarkup(
      <AdaptiveLayout breakpoint="large" compact={<Text>one</Text>} expanded={<Text>many</Text>} />,
    );
    expect(html).toContain("many");
  });
});
