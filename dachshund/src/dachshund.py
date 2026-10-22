from cadgen import build123d as bd
from cadgen import step, stl, threemf

# Такса (dachshund). Nose points to +X, paws on Z=0. Millimeters, ~140 mm long.
BODY_Z = 30.0
LEG_TOP = 26.0


def spheroid(rx, r, at, tilt=0.0):
    """Ellipsoid of revolution about X (half-length rx, radius r); tilt rotates about Y (deg, negative = nose up)."""
    with bd.BuildSketch(bd.Plane.XY) as sk:
        bd.Ellipse(rx, r)
        bd.split(bisect_by=bd.Plane.XZ, keep=bd.Keep.TOP)
    s = bd.revolve(sk.sketch, axis=bd.Axis.X)
    if tilt:
        s = s.rotate(bd.Axis.Y, tilt)
    return s.moved(bd.Location(at))


def leg(x, y):
    thigh = bd.Cone(4.6, 3.6, LEG_TOP, align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN))
    paw = spheroid(6.5, 3.4, (2.0, 0, 3.0))
    return (thigh + paw).moved(bd.Location((x, y, 0)))


def ear(side):
    # flat drop ear hanging from the top of the head, flared slightly outwards
    e = bd.extrude(bd.Plane.XZ * bd.Ellipse(6.5, 11.5), amount=1.6, both=True)
    e = e.rotate(bd.Axis.X, 14 * side)
    e = e.rotate(bd.Axis.Y, -8)
    return e.moved(bd.Location((103, side * 9.0, 49)))


@step(out="../STEP/dachshund.step")
@stl(out="../STL/dachshund.stl", mesh_tolerance=1e-3)
@threemf(out="../3MF/dachshund.3mf", mesh_tolerance=1e-3)
def dachshund():
    parts = [
        spheroid(50, 13, (48, 0, BODY_Z)),             # long body
        spheroid(21, 15.5, (78, 0, BODY_Z - 1)),        # deep chest
        spheroid(17, 9.5, (95, 0, 41), tilt=-42),       # neck rising to the head
        spheroid(12.5, 9.5, (106, 0, 52)),              # head
        spheroid(16, 5.6, (122, 0, 48.5), tilt=8),      # long snout
        spheroid(3.6, 3.6, (136.5, 0, 46.5)),           # nose
        spheroid(16, 3.2, (-9, 0, 40), tilt=35),        # tail raised, root inside the rump
        ear(1),
        ear(-1),
    ]
    for x in (80, 14):
        for y in (-8, 8):
            parts.append(leg(x, y))

    dog = parts[0]
    for p in parts[1:]:
        dog = dog + p
    # flat bottom for printing
    dog = dog - bd.Pos(60, 0, -20) * bd.Box(400, 100, 40)
    dog.label = "dachshund"
    return dog


if __name__ == "__main__":
    dachshund()
