export enum ServerCategory {
  Standard = "Standard",
  Preferred = "Preferred",
  Congested = "Congested",
  New = "New",
}

function isServerCategory(
  maybeServerCategory: string,
): maybeServerCategory is ServerCategory {
  return Object.values(ServerCategory)
    .map((v) => v.toString())
    .includes(maybeServerCategory);
}

// TODO: Move this to a mapper file.
export function toServerCategory(maybeServerCategory: string): ServerCategory {
  if (!isServerCategory(maybeServerCategory)) {
    throw new Error(`Not a server category: ${maybeServerCategory}`);
  }

  return maybeServerCategory;
}
