# Frontend representation coverage map

Maps each Herta-exposed SQLite-backed source group to a frontend representation
or explicit UX disposition. Tracks Aglaea #21.

## Retained route matrix (covered)

The retained route browser smoke (Aglaea #20) covers the first slice. See
[../runbooks/retained-route-smoke.md](../runbooks/retained-route-smoke.md).

| Source group | List route   | Detail route        | Smoke fixture   |
| ------------ | ------------ | ------------------- | --------------- |
| pokemon      | `/pokemon`   | `/pokemon/[slug]`   | bulbasaur       |
| moves        | `/moves`     | `/moves/[slug]`     | swords-dance    |
| abilities    | `/abilities` | `/abilities/[slug]` | battle-armor    |
| items        | `/items`     | `/items/[slug]`     | ability-capsule |

## Broader source groups (intentional UX deferrals)

These groups are not yet in the retained route smoke matrix. They are tracked
by Aglaea #21, Herta #47, and aglaea-contract #6, and will join the smoke once
their contracts and routes are retained.

| Source group             | Disposition                                                                                                                                                                 | Tracked by             |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| recipes                  | Rendered inline on item detail; no dedicated route yet                                                                                                                      | Aglaea #21             |
| spawns                   | Rendered in Pokemon detail with bucket, position, weight, levels, biome/time/moon/weather/sky/position/lure/multiplier condition facts; no dedicated spawn/preset route yet | Aglaea #21             |
| visual assets            | Rendered via Pokemon form/species images                                                                                                                                    | Aglaea #21             |
| localization/resource    | No Aglaea surface yet                                                                                                                                                       | Aglaea #21 / Herta #47 |
| biome/resource data      | No Aglaea surface yet                                                                                                                                                       | Aglaea #21 / Herta #47 |
| Minecraft/runtime groups | No Aglaea surface yet                                                                                                                                                       | Aglaea #21 / Herta #47 |

## No silent field drops

No frontend page silently ignores a contract field that is material to the
page's purpose. Fields omitted from a page are tracked here as intentional UX
deferrals and will move into the smoke matrix when their routes are retained.
