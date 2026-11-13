# Chanukia Lemon — instructions for the print shop

**Languages:** **English** · [Русский](PRINT-SHOP.ru.md) · [עברית](PRINT-SHOP.he.md)

This archive holds everything needed to print a Chabad-style hanukkiah for tea lights:
the STL models in print orientation, these instructions and the licence.

Website (3D model, latest files) and source code on GitHub:

- 🌐 https://phpcraftdream.github.io/chanukia-lemon/
- 💻 https://github.com/PHPCraftdream/chanukia-lemon

The assembled hanukkiah is 545 × 180 × 414 mm and has 20 parts plus a small fit test.

## What to print

The number before `.stl` in the name (`_x4`, `_x2`, `_x1`) is how many copies to print.

| File                            | Copies | Part                                                               |
| ------------------------------- | -----: | ------------------------------------------------------------------ |
| `chabad_fit_test.stl`           |      1 | fit test — **print it first**                                      |
| `chabad_foot.stl`               |      1 | foot                                                               |
| `chabad_stem_lower.stl`         |      1 | lower stem                                                         |
| `chabad_stem_upper.stl`         |      1 | upper stem                                                         |
| `chabad_shamash_cup.stl`        |      1 | shamash cup — heat-resistant plastic                               |
| `chabad_branch1_x2.stl`         |      2 | branch 1 — heat-resistant plastic                                  |
| `chabad_branch2a_inner_x2.stl`  |      2 | branch 2, inner half                                               |
| `chabad_branch34a_inner_x4.stl` |      4 | branches 3 and 4, inner half                                       |
| `chabad_branch23b_outer_x4.stl` |      4 | branches 2 and 3, outer half with the cup — heat-resistant plastic |
| `chabad_branch4b_outer_x2.stl`  |      2 | branch 4, outer half with the cup — heat-resistant plastic         |
| `chabad_rod_pin_x1.stl`         |      1 | stiffening rod, left half                                          |
| `chabad_rod_socket_x1.stl`      |      1 | stiffening rod, right half                                         |

## Material and settings

- FDM printer, **PETG** for the stem and the inner branch halves (it withstands warmth
  better than PLA).
- Bed of at least 256 mm: the longest parts are the rods (272 mm), they fit diagonally;
  branch pieces are at most 211 mm.
- Height: the stem pieces are up to 187 mm tall; the foot is 180 mm across.
- Parts with cups — shamash cup, branch 1 and the outer branch halves: **heat-resistant
  plastic** (ASA, ABS or PC). The shamash cup stands upright, opening up, no supports.
- Stem and foot: 4 perimeters, gyroid infill 12–15 %, 5 top and bottom layers.
- Branches: 4–5 perimeters, gyroid infill 25–30 %.
- Rods, tenons and pins: solid (100 % infill).
- Layer height 0.12–0.16 mm, nozzle 0.4 mm, to keep the reliefs and the fit ribs crisp.
- Branches lie on the bed with supports; the foot lies flat; the lower and upper stem stand
  upright with a brim.
- Do not scale the models: the joints are sized to fit each other.

## Fit test first

`chabad_fit_test.stl` is a small coupon (about 6 cm³) that does not attach to the
hanukkiah: a block with two holes and two short plugs. Print it with the same printer and
material as the real parts, then push each plug into its hole — the ribbed one into the
round hole, the one with a flat into the D-shaped hole.

- Two plastics (PETG and a heat-resistant one) shrink differently: print the coupon in
  both of them.
- Plugs go in firmly by hand, without play: print the rest.
- Too tight or too loose: tell the customer; the clearances are adjusted in the source
  and new files are generated.

## Assembly (for the customer)

1. Join the foot, the lower stem, the upper stem and the shamash cup on their pins and glue
   the joints.
2. Insert the branches from the stem outwards: 1, then the inner halves of 2, 3 and 4, then
   the outer halves with the cups; glue every joint.
3. Push the rod halves through the top knops under the cups from both sides until they snap
   inside the stem.
4. Put a drop of epoxy or CA glue into every rod hole in the top knops from the back.

## Safety and licence

Tea lights only in their aluminium cups; never leave a lit hanukkiah unattended.

The models are licensed under the Chanukia Lemon Model License (`LICENSE-MODELS.md` in
this archive; the code that generates them is GPL v3, see `LICENSE` and `NOTICE`).

**Selling prints:** printed objects made from these models, from forks or from any
derivative may be sold only if **every purchase includes this card** — printed in the
package or attached to the order:

```
Chanukia Lemon by PHPCraftdream
Website: https://phpcraftdream.github.io/chanukia-lemon/
Source:  https://github.com/PHPCraftdream/chanukia-lemon
```
