# Chanukia Lemon — instructions for the print shop

**Languages:** **English** · [Русский](PRINT-SHOP.ru.md) · [עברית](PRINT-SHOP.he.md)

This archive holds everything needed to print a Chabad-style hanukkiah for tea lights:
the STL models in print orientation, these instructions and the licence.

Website (3D model, latest files) and source code on GitHub:

- 🌐 https://phpcraftdream.github.io/chanukia-lemon/
- 💻 https://github.com/PHPCraftdream/chanukia-lemon

The assembled hanukkiah is 545 × 180 × 414 mm and has 14 parts plus a small fit test.

## What to print

The number before `.stl` in the name (`_x2`, `_x1`) is how many copies to print.

| File                           | Copies | Part                                    |
| ------------------------------ | -----: | --------------------------------------- |
| `chabad_fit_test.stl`          |      1 | fit test — **print it first**           |
| `chabad_stem_lower.stl`        |      1 | foot and lower stem                     |
| `chabad_stem_upper.stl`        |      1 | upper stem with the shamash cup         |
| `chabad_branch1_x2.stl`        |      2 | branch 1                                |
| `chabad_branch2_x2.stl`        |      2 | branch 2                                |
| `chabad_branch3_x2.stl`        |      2 | branch 3                                |
| `chabad_branch4a_inner_x2.stl` |      2 | branch 4, inner half                    |
| `chabad_branch4b_outer_x2.stl` |      2 | branch 4, outer half                    |
| `chabad_rod_pin_x1.stl`        |      1 | stiffening rod, left half               |
| `chabad_rod_socket_x1.stl`     |      1 | stiffening rod, right half              |

## Material and settings

- FDM printer, **PETG** (it withstands the warmth of tea lights better than PLA).
- Bed of at least 300 mm: the longest part is 298 mm; the rods fit diagonally on 256 mm.
- Height: the upper stem is 240 mm tall.
- Stem and foot: 4 perimeters, gyroid infill 12–15 %, 5 top and bottom layers.
- Branches: 4–5 perimeters, gyroid infill 25–30 %.
- Rods, tenons and pins: solid (100 % infill).
- Layer height 0.12–0.16 mm, nozzle 0.4 mm, to keep the reliefs and the fit ribs crisp.
- Branches lie on the bed with supports; the upper stem stands upright with a brim.
- Do not scale the models: the joints are sized to fit each other.

## Fit test first

`chabad_fit_test.stl` is a small coupon (about 6 cm³) that does not attach to the
hanukkiah: a block with two holes and two short plugs. Print it with the same printer and
material as the real parts, then push each plug into its hole — the ribbed one into the
round hole, the one with a flat into the D-shaped hole.

- Plugs go in firmly by hand, without play: print the rest.
- Too tight or too loose: tell the customer; the clearances are adjusted in the source
  and new files are generated.

## Assembly (for the customer)

1. Join the stem halves on their pins and glue the joint.
2. Insert the branches from the stem outwards: 1, 2, 3, then branch 4 assembled from its
   two halves.
3. Push the rod halves through the cups from both sides until they snap inside the stem.
4. Put a drop of epoxy or CA glue into every rod hole in the cups from the back.

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
