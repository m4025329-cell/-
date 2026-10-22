from cadgen import build123d as bd
from cadgen import step, stl, threemf

# Dachshund (такса), nose points to +X, feet on Z=0. Millimeters, ~120 mm long.
LEG_H = 14.0
BODY_Z = 27.0


def ellipsoid(rx, ry, rz, at):
    # spheroid of revolution about X (ry/rz averaged), built as a revolved half-ellipse
    r = (ry + rz) / 2
    with bd.BuildSketch(bd.Plane.XY) as sk:
        bd.Ellipse(rx, r)
        bd.split(bisect_by=bd.Plane.XZ, keep=bd.Keep.TOP)
    s = bd.revolve(sk.sketch, axis=bd.Axis.X)
    return s.moved(bd.Location(at))


def leg(x, y):
    # slightly tapered leg with a rounded paw, overlapping into the belly
    cyl = bd.Cone(4.4, 3.4, LEG_H + 8, align=(bd.Align.CENTER, bd.Align.CENTER, bd.Align.MIN))
    paw = ellipsoid(5.2, 4.2, 2.6, (1.2, 0, 2.2))
    return (cyl.moved(bd.Location((0, 0, 0))) + paw).moved(bd.Location((x, y, 0)))


def ear(y):
    e = bd.extrude(bd.Plane.XZ * bd.Ellipse(6.5, 11), amount=2.2, both=True)
    e = e.rotate(bd.Axis.X, -12 if y > 0 else 12)
    return e.moved(bd.Location((83, y * 8.4, 50)))


@step(out="../STEP/dachshund.step")
@stl(out="../STL/dachshund.stl")
@threemf(out="../3MF/dachshund.3mf")
def dachshund():
    body = ellipsoid(46, 12.5, 13.5, (45, 0, BODY_Z))
    chest = ellipsoid(18, 13.5, 14.5, (70, 0, BODY_Z + 0.5))
    neck = ellipsoid(14, 8.5, 13, (86, 0, BODY_Z + 11)).rotate(bd.Axis.Y, 0)
    head = ellipsoid(13, 9.5, 9.5, (96, 0, BODY_Z + 22))
    snout = ellipsoid(14, 5.6, 5.0, (110, 0, BODY_Z + 19.5))
    nose = ellipsoid(3.2, 3.6, 3.0, (123.5, 0, BODY_Z + 20.5))
    tail = ellipsoid(14, 3.2, 3.0, (-6, 0, BODY_Z + 8)).rotate(
        bd.Axis.Y, 0)
    tail = bd.Pos(-2, 0, 0) * tail.rotate(bd.Axis.Y, 28) if False else tail

    parts = [body, chest, neck, head, snout, nose, tail, ear(1), ear(-1)]
    for x in (72, 14):
        for y in (-8.5, 8.5):
            parts.append(leg(x, y))

    dog = parts[0]
    for p in parts[1:]:
        dog = dog + p
    # flatten the paws so the model sits flat on the build plate
    cut = bd.Pos(60, 0, -20) * bd.Box(300, 100, 40)
    dog = dog - cut
    dog.label = "dachshund"
    return dog


if __name__ == "__main__":
    dachshund()
