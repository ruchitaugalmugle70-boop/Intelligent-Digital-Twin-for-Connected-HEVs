"""
E-TWIN Digital Twin — Blender Python Script
Creates a detailed 3D electric scooter model matching the E-TWIN CAD specification sheet.
Exports to .glb for use with Three.js GLTFLoader.

Run with:
  /Applications/Blender.app/Contents/MacOS/Blender --background --python create_etwin_scooter.py
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector, Euler

# ── CLEANUP ──────────────────────────────────────────────────
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# Output path
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_GLB = os.path.join(OUTPUT_DIR, '..', 'frontend', 'assets', 'etwin_scooter.glb')

# ── MATERIAL HELPERS ─────────────────────────────────────────
def make_mat(name, color, metallic=0.0, roughness=0.5, emission_color=None, emission_strength=0.0):
    """Create a PBR material."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    if bsdf is None:
        bsdf = mat.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (*hex_to_rgb(color), 1.0)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if emission_color and emission_strength > 0:
        bsdf.inputs['Emission Color'].default_value = (*hex_to_rgb(emission_color), 1.0)
        bsdf.inputs['Emission Strength'].default_value = emission_strength
    return mat

def hex_to_rgb(hex_str):
    """Convert hex color to RGB tuple (0-1)."""
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) / 255.0 for i in (0, 2, 4))

def assign_mat(obj, mat):
    """Assign material to object."""
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

def set_smooth(obj):
    """Set smooth shading."""
    for poly in obj.data.polygons:
        poly.use_smooth = True

# ── MATERIALS ────────────────────────────────────────────────
# Body/Shell (Arctic White default — clearcoat automotive)
mat_body_white = make_mat('Body_ArcticWhite', '#F0F0F0', metallic=0.15, roughness=0.12)
mat_body_dark = make_mat('Body_DarkTrim', '#0A0F1E', metallic=0.2, roughness=0.55)
mat_seat = make_mat('Seat_Leather', '#111111', metallic=0.0, roughness=0.88)
mat_metal_chrome = make_mat('Chrome', '#C0C8D0', metallic=0.95, roughness=0.05)
mat_metal_dark = make_mat('DarkMetal', '#2A3040', metallic=0.85, roughness=0.2)
mat_rubber = make_mat('Rubber_Tire', '#0D0D0D', metallic=0.0, roughness=0.92)
mat_brake_disc = make_mat('BrakeDisc', '#7A8899', metallic=0.9, roughness=0.15)

# CAD Key Component Materials (Matching Specification Legend)
mat_battery = make_mat('Battery_LiIon', '#10B981', metallic=0.5, roughness=0.3, emission_color='#059669', emission_strength=0.5)
mat_bms = make_mat('BMS', '#F59E0B', metallic=0.6, roughness=0.3, emission_color='#D97706', emission_strength=0.4)
mat_controller = make_mat('Controller_ECU', '#0284C7', metallic=0.7, roughness=0.2, emission_color='#0369A1', emission_strength=0.4)
mat_motor = make_mat('Motor_PMSM', '#EF4444', metallic=0.85, roughness=0.2, emission_color='#B91C1C', emission_strength=0.5)
mat_suspension = make_mat('Suspension', '#A855F7', metallic=0.8, roughness=0.2, emission_color='#7E22CE', emission_strength=0.3)
mat_harness = make_mat('WiringHarness', '#F97316', metallic=0.3, roughness=0.4, emission_color='#C2410C', emission_strength=0.4)

# LED Lights
mat_drl = make_mat('DRL_LED', '#E0F2FE', metallic=0.1, roughness=0.1, emission_color='#BFDBFE', emission_strength=3.0)
mat_tail_led = make_mat('TailLED', '#EF4444', metallic=0.1, roughness=0.1, emission_color='#EF4444', emission_strength=4.0)
mat_tft = make_mat('TFT_Display', '#06B6D4', metallic=0.1, roughness=0.1, emission_color='#06B6D4', emission_strength=2.0)
mat_e_badge = make_mat('E_Badge', '#38BDF8', metallic=0.3, roughness=0.15, emission_color='#38BDF8', emission_strength=2.5)
mat_indicator = make_mat('Indicator', '#FBBF24', metallic=0.1, roughness=0.15, emission_color='#FBBF24', emission_strength=2.0)

# ── HELPER: ADD OBJECT ───────────────────────────────────────
def add_cylinder(name, r1, r2, depth, loc, rot=(0,0,0), mat=None, segments=32):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=segments, radius=r1, depth=depth,
        location=loc, rotation=rot
    )
    obj = bpy.context.active_object
    obj.name = name
    # Adjust top radius if different
    if abs(r1 - r2) > 0.001:
        bpy.ops.object.mode_set(mode='EDIT')
        bm = bmesh.from_edit_mesh(obj.data)
        for v in bm.verts:
            if v.co.z > 0:
                factor = r2 / r1
                v.co.x *= factor
                v.co.y *= factor
        bmesh.update_edit_mesh(obj.data)
        bpy.ops.object.mode_set(mode='OBJECT')
    set_smooth(obj)
    if mat:
        assign_mat(obj, mat)
    return obj

def add_cube(name, size, loc, rot=(0,0,0), mat=None, scale=(1,1,1)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot, scale=scale)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (size[0], size[1], size[2])
    bpy.ops.object.transform_apply(scale=True)
    if mat:
        assign_mat(obj, mat)
    return obj

def add_torus(name, major_r, minor_r, loc, rot=(0,0,0), mat=None, major_segs=48, minor_segs=16):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major_r, minor_radius=minor_r,
        major_segments=major_segs, minor_segments=minor_segs,
        location=loc, rotation=rot
    )
    obj = bpy.context.active_object
    obj.name = name
    set_smooth(obj)
    if mat:
        assign_mat(obj, mat)
    return obj

def add_sphere(name, radius, loc, mat=None, segments=24):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, segments=segments, ring_count=segments//2, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    set_smooth(obj)
    if mat:
        assign_mat(obj, mat)
    return obj

def add_cone(name, r1, r2, depth, loc, rot=(0,0,0), mat=None, segments=32):
    bpy.ops.mesh.primitive_cone_add(
        vertices=segments, radius1=r1, radius2=r2, depth=depth,
        location=loc, rotation=rot
    )
    obj = bpy.context.active_object
    obj.name = name
    set_smooth(obj)
    if mat:
        assign_mat(obj, mat)
    return obj

# ── CREATE COLLECTION ────────────────────────────────────────
scooter_col = bpy.data.collections.new('E-TWIN_Scooter')
scene.collection.children.link(scooter_col)

def link_to_scooter(obj):
    """Move object to scooter collection."""
    for col in obj.users_collection:
        col.objects.unlink(obj)
    scooter_col.objects.link(obj)

# ── BUILD THE E-TWIN SCOOTER ─────────────────────────────────

# Dimensions reference (from CAD): Length ~1810mm, Height ~1120mm, Width ~700mm
# Scale: 1 Blender unit = 1 meter. So scooter is ~1.81m long, ~1.12m tall.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. FRONT WHEEL ASSEMBLY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHEEL_R = 0.20  # Wheel outer radius
TIRE_THICK = 0.055  # Tire tube radius
FW_POS = (0, 0.65, 0.20)  # Front wheel center

# Front Tire
fw_tire = add_torus('FrontTire', WHEEL_R, TIRE_THICK, FW_POS, rot=(math.pi/2, 0, 0), mat=mat_rubber)
link_to_scooter(fw_tire)

# Front Rim
fw_rim = add_cylinder('FrontRim', 0.065, 0.065, 0.07, FW_POS, rot=(math.pi/2, 0, 0), mat=mat_metal_chrome, segments=24)
link_to_scooter(fw_rim)

# Front Axle
fw_axle = add_cylinder('FrontAxle', 0.012, 0.012, 0.18, FW_POS, rot=(math.pi/2, 0, 0), mat=mat_metal_dark)
link_to_scooter(fw_axle)

# Front Disc Brake
fw_disc = add_cylinder('FrontDisc', 0.13, 0.13, 0.006, (0.06, FW_POS[1], FW_POS[2]), rot=(math.pi/2, 0, 0), mat=mat_brake_disc, segments=32)
link_to_scooter(fw_disc)

# Brake Caliper
fw_caliper = add_cube('FrontCaliper', (0.03, 0.025, 0.06), (0.08, FW_POS[1]+0.1, FW_POS[2]), mat=mat_metal_dark)
link_to_scooter(fw_caliper)

# Front Fender (mudguard over wheel)
fender_front = add_cylinder('FrontFender', WHEEL_R + 0.04, WHEEL_R + 0.04, 0.12,
                            (0, FW_POS[1], FW_POS[2]+0.05), rot=(math.pi/2, 0, 0), mat=mat_body_white, segments=32)
# Cut fender to half-shell (scale Z to flatten bottom)
fender_front.scale.z = 0.5
bpy.ops.object.transform_apply(scale=True)
link_to_scooter(fender_front)

# Spoke detail (simplified 5-spoke alloy)
for i in range(5):
    angle = i * (2 * math.pi / 5)
    sx = FW_POS[0]
    sy = FW_POS[1] + math.sin(angle) * 0.12
    sz = FW_POS[2] + math.cos(angle) * 0.12
    spoke = add_cube(f'FW_Spoke_{i}', (0.008, 0.11, 0.015), (sx, sy, sz),
                     rot=(0, 0, angle), mat=mat_metal_chrome)
    link_to_scooter(spoke)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. FRONT FORK (TELESCOPIC SUSPENSION)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

fork_angle = -0.22  # Rake angle

# Left fork tube (chrome inner + outer tube)
lf_outer = add_cylinder('LeftFork_Outer', 0.022, 0.022, 0.42,
                        (-0.08, FW_POS[1]+0.06, FW_POS[2]+0.26),
                        rot=(fork_angle, 0, 0), mat=mat_metal_dark, segments=16)
link_to_scooter(lf_outer)

lf_inner = add_cylinder('LeftFork_Inner', 0.016, 0.016, 0.26,
                        (-0.08, FW_POS[1]+0.04, FW_POS[2]+0.42),
                        rot=(fork_angle, 0, 0), mat=mat_metal_chrome, segments=16)
link_to_scooter(lf_inner)

# Right fork tube
rf_outer = add_cylinder('RightFork_Outer', 0.022, 0.022, 0.42,
                        (0.08, FW_POS[1]+0.06, FW_POS[2]+0.26),
                        rot=(fork_angle, 0, 0), mat=mat_metal_dark, segments=16)
link_to_scooter(rf_outer)

rf_inner = add_cylinder('RightFork_Inner', 0.016, 0.016, 0.26,
                        (0.08, FW_POS[1]+0.04, FW_POS[2]+0.42),
                        rot=(fork_angle, 0, 0), mat=mat_metal_chrome, segments=16)
link_to_scooter(rf_inner)

# Fork crown/triple clamp
fork_crown = add_cube('ForkCrown', (0.22, 0.04, 0.04), (0, 0.68, 0.56), mat=mat_metal_dark)
link_to_scooter(fork_crown)

# Steering column
steer_col = add_cylinder('SteeringColumn', 0.025, 0.025, 0.35,
                         (0, 0.38, 0.62), rot=(0.15, 0, 0), mat=mat_metal_dark, segments=12)
link_to_scooter(steer_col)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. FRONT APRON & HEADLIGHT ASSEMBLY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Front apron (main sculpted body panel)
apron = add_cylinder('FrontApron', 0.22, 0.16, 0.50,
                     (0, 0.16, 0.52), rot=(0.15, 0, 0), mat=mat_body_white, segments=32)
apron.scale.x = 1.35
bpy.ops.object.transform_apply(scale=True)
link_to_scooter(apron)

# Front nose cone
nose = add_sphere('NoseCone', 0.18, (0, 0.18, 0.72), mat=mat_body_white, segments=24)
nose.scale = (1.3, 0.8, 1.0)
bpy.ops.object.transform_apply(scale=True)
link_to_scooter(nose)

# Curved LED DRL Brow (signature E-TWIN design)
drl_brow = add_torus('DRL_Brow', 0.14, 0.012, (0, 0.22, 0.74),
                     rot=(0, 0, 0), mat=mat_drl, major_segs=32, minor_segs=8)
drl_brow.scale = (1.5, 0.5, 1.0)
bpy.ops.object.transform_apply(scale=True)
link_to_scooter(drl_brow)

# Central Projector Headlight Lens
headlight = add_cylinder('Headlight_Lens', 0.035, 0.035, 0.02,
                         (0, 0.2, 0.76), rot=(0, 0, 0), mat=mat_drl, segments=20)
link_to_scooter(headlight)

# "E" Badge
e_badge = add_cube('E_Badge', (0.04, 0.04, 0.008), (0, 0.32, 0.72), mat=mat_e_badge)
link_to_scooter(e_badge)

# Front turn indicators (both sides)
for side in [-1, 1]:
    ind = add_sphere(f'FrontIndicator_{"L" if side < 0 else "R"}', 0.015,
                     (side * 0.18, 0.22, 0.7), mat=mat_indicator, segments=12)
    link_to_scooter(ind)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4. HANDLEBAR & COCKPIT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Handlebar tube
hbar = add_cylinder('Handlebar', 0.012, 0.012, 0.58,
                    (0, 0.18, 0.72), rot=(0, 0, math.pi/2), mat=mat_metal_dark, segments=12)
hbar.location = (0, 0.60, 0.72)
link_to_scooter(hbar)

# Grips (rubber ends)
for side in [-1, 1]:
    grip = add_cylinder(f'Grip_{"L" if side<0 else "R"}', 0.016, 0.016, 0.1,
                        (side * 0.32, 0.60, 0.72), rot=(0, 0, math.pi/2), mat=mat_rubber, segments=12)
    link_to_scooter(grip)

# Brake levers
for side in [-1, 1]:
    lever = add_cube(f'BrakeLever_{"L" if side<0 else "R"}', (0.008, 0.06, 0.015),
                     (side * 0.26, 0.58, 0.72), rot=(0.4, 0, 0), mat=mat_metal_chrome)
    link_to_scooter(lever)

# Stalk mirrors
for side in [-1, 1]:
    stalk = add_cylinder(f'MirrorStalk_{"L" if side<0 else "R"}', 0.005, 0.005, 0.12,
                         (side * 0.3, 0.64, 0.74), rot=(0, 0, side * 0.35), mat=mat_metal_dark, segments=8)
    link_to_scooter(stalk)

    mirror = add_cube(f'Mirror_{"L" if side<0 else "R"}', (0.06, 0.035, 0.01),
                      (side * 0.36, 0.68, 0.74), mat=mat_body_dark)
    link_to_scooter(mirror)

# Digital TFT Dashboard Display
tft = add_cube('TFT_Display', (0.1, 0.06, 0.012), (0, 0.56, 0.7), rot=(-0.5, 0, 0), mat=mat_tft)
link_to_scooter(tft)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 5. MAIN BODY / CHASSIS / FLOORBOARD
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Step-through tunnel (connects front apron to rear body)
tunnel = add_cube('StepThrough_Tunnel', (0.10, 0.35, 0.06), (0, 0.12, 0.42),
                  rot=(0.6, 0, 0), mat=mat_body_dark)
link_to_scooter(tunnel)

# Floorboard (wide flat platform under feet)
floorboard = add_cube('Floorboard', (0.32, 0.55, 0.06), (0, -0.42, 0.18), mat=mat_body_dark)
link_to_scooter(floorboard)

# Floorboard textured anti-slip surface
floor_grip = add_cube('FloorGrip', (0.28, 0.48, 0.008), (0, -0.42, 0.215), mat=mat_rubber)
link_to_scooter(floor_grip)

# Side panels (left + right body covers)
for side in [-1, 1]:
    panel = add_cube(f'SidePanel_{"L" if side<0 else "R"}', (0.015, 0.6, 0.26),
                     (side * 0.17, -0.22, 0.30), mat=mat_body_white)
    link_to_scooter(panel)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 6. REAR BODY, SEAT, & TAIL SECTION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Rear body shell (under-seat area)
rear_body = add_cube('RearBody', (0.28, 0.60, 0.28), (0, -0.20, -0.14), mat=mat_body_white)
link_to_scooter(rear_body)

# Seat (dual saddle — rider + pillion)
seat = add_cube('Seat_Main', (0.26, 0.52, 0.07), (0, -0.04, 0.02), mat=mat_seat)
# Sculpt seat slightly: round top
seat.location = (0, -0.20, 0.015)
link_to_scooter(seat)

# Seat bump/cushion (subtle curvature)
seat_cushion = add_cylinder('SeatCushion', 0.13, 0.13, 0.5,
                            (0, -0.22, 0.05), rot=(math.pi/2, 0, 0), mat=mat_seat, segments=16)
seat_cushion.scale = (1.9, 1, 0.4)
bpy.ops.object.transform_apply(scale=True)
link_to_scooter(seat_cushion)

# Grab rail
grab_rail_L = add_cylinder('GrabRail_L', 0.01, 0.01, 0.2,
                           (-0.12, -0.38, -0.02), rot=(math.pi/2, 0, 0), mat=mat_metal_chrome, segments=8)
link_to_scooter(grab_rail_L)

grab_rail_R = add_cylinder('GrabRail_R', 0.01, 0.01, 0.2,
                           (0.12, -0.38, -0.02), rot=(math.pi/2, 0, 0), mat=mat_metal_chrome, segments=8)
link_to_scooter(grab_rail_R)

grab_rail_back = add_cylinder('GrabRail_Back', 0.01, 0.01, 0.22,
                              (0, -0.40, -0.12), rot=(0, 0, math.pi/2), mat=mat_metal_chrome, segments=8)
link_to_scooter(grab_rail_back)

# Tail panel
tail_panel = add_cube('TailPanel', (0.26, 0.04, 0.14), (0, -0.36, -0.28), mat=mat_body_white)
link_to_scooter(tail_panel)

# LED Tail Light Strip
tail_led = add_cube('TailLight_LED', (0.18, 0.025, 0.015), (0, -0.38, -0.22), mat=mat_tail_led)
link_to_scooter(tail_led)

# Rear turn indicators
for side in [-1, 1]:
    r_ind = add_sphere(f'RearIndicator_{"L" if side<0 else "R"}', 0.012,
                       (side * 0.14, -0.36, -0.24), mat=mat_indicator, segments=10)
    link_to_scooter(r_ind)

# License plate holder
plate_holder = add_cube('PlateHolder', (0.12, 0.005, 0.08), (0, -0.50, -0.32), mat=mat_body_dark)
link_to_scooter(plate_holder)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 7. REAR WHEEL & HUB MOTOR
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RW_POS = (0, -0.58, 0.20)

# Rear Tire
rw_tire = add_torus('RearTire', WHEEL_R, TIRE_THICK+0.01, RW_POS, rot=(math.pi/2, 0, 0), mat=mat_rubber)
link_to_scooter(rw_tire)

# Rear Rim
rw_rim = add_cylinder('RearRim', 0.065, 0.065, 0.08, RW_POS, rot=(math.pi/2, 0, 0), mat=mat_metal_chrome, segments=24)
link_to_scooter(rw_rim)

# 🔴 PMSM Hub Motor (Key CAD Component)
hub_motor = add_cylinder('HubMotor_PMSM', 0.14, 0.14, 0.10, RW_POS, rot=(math.pi/2, 0, 0), mat=mat_motor, segments=28)
link_to_scooter(hub_motor)

# Motor cooling fins
for i in range(8):
    angle = i * (math.pi / 4)
    fin_y = RW_POS[1] + math.cos(angle) * 0.12
    fin_z = RW_POS[2] + math.sin(angle) * 0.12
    fin = add_cube(f'MotorFin_{i}', (0.04, 0.015, 0.01), (0, fin_y, fin_z), mat=mat_motor)
    link_to_scooter(fin)

# Rear Disc Brake
rw_disc = add_cylinder('RearDisc', 0.10, 0.10, 0.005, (-0.06, RW_POS[1], RW_POS[2]),
                       rot=(math.pi/2, 0, 0), mat=mat_brake_disc, segments=28)
link_to_scooter(rw_disc)

# Rear fender
fender_rear = add_cylinder('RearFender', WHEEL_R + 0.05, WHEEL_R + 0.05, 0.14,
                           (0, RW_POS[1]+0.05, RW_POS[2]+0.06), rot=(math.pi/2, 0, 0), mat=mat_body_dark, segments=24)
fender_rear.scale.z = 0.45
bpy.ops.object.transform_apply(scale=True)
link_to_scooter(fender_rear)

# Rear spokes
for i in range(5):
    angle = i * (2 * math.pi / 5)
    sy = RW_POS[1] + math.sin(angle) * 0.11
    sz = RW_POS[2] + math.cos(angle) * 0.11
    spoke = add_cube(f'RW_Spoke_{i}', (0.008, 0.10, 0.015), (0, sy, sz),
                     rot=(angle, 0, 0), mat=mat_metal_chrome)
    link_to_scooter(spoke)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 8. REAR SUSPENSION (DUAL SPRING SHOCK ABSORBERS)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

for side in [-1, 1]:
    # 🟣 Suspension spring coil
    shock_body = add_cylinder(f'Shock_{"L" if side<0 else "R"}', 0.018, 0.018, 0.30,
                              (side * 0.10, -0.42, -0.02), rot=(0.45, 0, 0), mat=mat_suspension, segments=12)
    link_to_scooter(shock_body)

    # Spring coils (visual rings around shock)
    for j in range(5):
        coil = add_torus(f'ShockCoil_{"L" if side<0 else "R"}_{j}', 0.022, 0.004,
                         (side * 0.10, -0.42 + j*0.045, -0.02 - j*0.04),
                         rot=(0.45, 0, 0), mat=mat_suspension, major_segs=16, minor_segs=6)
        link_to_scooter(coil)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 9. SWINGARM
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Single-sided swingarm (connects rear wheel to chassis pivot)
swingarm = add_cube('Swingarm', (0.06, 0.42, 0.04), (0.06, -0.44, 0.10),
                    rot=(0.15, 0, 0), mat=mat_metal_dark)
link_to_scooter(swingarm)

# Swingarm pivot
pivot = add_cylinder('SwingarmPivot', 0.025, 0.025, 0.18,
                     (0, -0.25, 0.10), rot=(0, 0, math.pi/2), mat=mat_metal_dark, segments=12)
link_to_scooter(pivot)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 10. KEY CAD INTERNAL COMPONENTS (Color-Coded)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 🟢 Lithium-ion Battery Pack (inside floorboard)
battery = add_cube('Battery_LiIon_Pack', (0.24, 0.42, 0.06), (0, -0.42, 0.15), mat=mat_battery)
link_to_scooter(battery)

# 🟡 BMS Module (on top of battery)
bms_module = add_cube('BMS_Module', (0.14, 0.10, 0.025), (0, -0.38, 0.195), mat=mat_bms)
link_to_scooter(bms_module)

# 🔵 Controller / ECU (under seat, front of rear body)
ecu = add_cube('Controller_ECU', (0.16, 0.12, 0.08), (0, -0.12, -0.06), mat=mat_controller)
link_to_scooter(ecu)

# 🟠 High-Voltage Wiring Harness (cables connecting battery → controller → motor)
for i in range(3):
    harness_seg = add_cylinder(f'Harness_Segment_{i}', 0.006, 0.006, 0.35,
                               (0.04 + i*0.02, -0.28 - i*0.12, 0.08),
                               rot=(math.pi/2 + 0.2 * i, 0, 0), mat=mat_harness, segments=8)
    link_to_scooter(harness_seg)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 11. KICKSTAND
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

kickstand = add_cylinder('Kickstand', 0.008, 0.008, 0.22,
                         (-0.16, -0.38, 0.10), rot=(0.2, 0, 0.4), mat=mat_metal_dark, segments=8)
link_to_scooter(kickstand)

kickstand_foot = add_cube('KickstandFoot', (0.03, 0.01, 0.02), (-0.18, -0.44, 0.02), mat=mat_metal_dark)
link_to_scooter(kickstand_foot)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 12. EXHAUST / SILENCER PIPE (Even EVs may have cooling pipe)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

exhaust_pipe = add_cylinder('CoolantPipe', 0.02, 0.015, 0.35,
                            (0.14, -0.52, 0.08), rot=(math.pi/2 + 0.15, 0, 0.1), mat=mat_metal_dark, segments=10)
link_to_scooter(exhaust_pipe)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 13. GROUND REFERENCE PLANE (Shadow Catcher)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

bpy.ops.mesh.primitive_plane_add(size=4, location=(0, 0, -0.055))
ground = bpy.context.active_object
ground.name = 'GroundPlane'
ground_mat = make_mat('Ground', '#0A0F1D', roughness=0.95)
assign_mat(ground, ground_mat)
link_to_scooter(ground)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CAMERA & LIGHTS (for preview)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Camera
bpy.ops.object.camera_add(location=(1.2, -1.4, 0.7), rotation=(math.radians(70), 0, math.radians(40)))
cam = bpy.context.active_object
cam.name = 'MainCamera'
scene.camera = cam

# Sun light
bpy.ops.object.light_add(type='SUN', location=(2, -1, 3))
sun = bpy.context.active_object
sun.name = 'SunLight'
sun.data.energy = 3.5

# Fill light (cyan accent)
bpy.ops.object.light_add(type='POINT', location=(-1.5, 1, 1.5))
fill = bpy.context.active_object
fill.name = 'FillLight_Cyan'
fill.data.energy = 200
fill.data.color = hex_to_rgb('38BDF8')

# Rim light (purple)
bpy.ops.object.light_add(type='POINT', location=(0, 2, 2))
rim = bpy.context.active_object
rim.name = 'RimLight_Purple'
rim.data.energy = 100
rim.data.color = hex_to_rgb('A855F7')

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# EXPORT AS .glb
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Ensure output directory exists
os.makedirs(os.path.dirname(OUTPUT_GLB), exist_ok=True)

# Select all objects in scooter collection
bpy.ops.object.select_all(action='DESELECT')
for obj in scooter_col.objects:
    obj.select_set(True)

# Export glTF Binary (.glb)
bpy.ops.export_scene.gltf(
    filepath=OUTPUT_GLB,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
    export_materials='EXPORT',
    export_lights=False,
    export_cameras=False,
)

print(f"\n✅ E-TWIN Scooter model exported to: {OUTPUT_GLB}")
print(f"   Total objects: {len(scooter_col.objects)}")
print("   Ready for Three.js GLTFLoader!")
