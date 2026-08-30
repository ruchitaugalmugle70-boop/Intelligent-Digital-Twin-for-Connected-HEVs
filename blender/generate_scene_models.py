"""
Blender 5.x Automation Script
Creates the High-Fidelity 3D Scooter + Rider Model matching the reference image.
Exports GLB directly into frontend assets.
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector, Euler

# Clean scene
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
GLB_REACT = os.path.join(OUTPUT_DIR, '..', 'frontend-react', 'public', 'assets', 'scooter_rider.glb')
GLB_FRONTEND = os.path.join(OUTPUT_DIR, '..', 'frontend', 'assets', 'scooter_rider.glb')

os.makedirs(os.path.dirname(GLB_REACT), exist_ok=True)
os.makedirs(os.path.dirname(GLB_FRONTEND), exist_ok=True)

# ── HELPER FUNCTIONS ──────────────────────────────────────────────────────────

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) / 255.0 for i in (0, 2, 4))

def make_pbr(name, color, metallic=0.0, roughness=0.5, emission=None, emission_strength=0.0, alpha=1.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get('Principled BSDF')
    if bsdf is None:
        bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    
    # Base color
    r, g, b = hex_to_rgb(color)
    bsdf.inputs['Base Color'].default_value = (r, g, b, alpha)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    
    if emission and emission_strength > 0:
        er, eg, eb = hex_to_rgb(emission)
        # Blender 4/5 uses 'Emission Color'
        if 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = (er, eg, eb, 1.0)
            bsdf.inputs['Emission Strength'].default_value = emission_strength
    return mat

def apply_mat(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

def set_smooth(obj):
    for poly in obj.data.polygons:
        poly.use_smooth = True

def add_box(name, size, loc, rot=(0,0,0), mat=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (size[0], size[1], size[2])
    bpy.ops.object.transform_apply(scale=True, rotation=False, location=False)
    set_smooth(obj)
    if mat:
        apply_mat(obj, mat)
    return obj

def add_cyl(name, r, depth, loc, rot=(0,0,0), mat=None, segs=32):
    bpy.ops.mesh.primitive_cylinder_add(vertices=segs, radius=r, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    set_smooth(obj)
    if mat:
        apply_mat(obj, mat)
    return obj

def add_torus(name, maj_r, min_r, loc, rot=(0,0,0), mat=None, maj_segs=48, min_segs=24):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=maj_r, minor_radius=min_r,
        major_segments=maj_segs, minor_segments=min_segs,
        location=loc, rotation=rot
    )
    obj = bpy.context.active_object
    obj.name = name
    set_smooth(obj)
    if mat:
        apply_mat(obj, mat)
    return obj

def add_sphere(name, radius, loc, scale=(1,1,1), mat=None, segs=32):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, segments=segs, ring_count=segs//2, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(scale=True, rotation=False, location=False)
    set_smooth(obj)
    if mat:
        apply_mat(obj, mat)
    return obj

# ── CREATE MATERIALS ──────────────────────────────────────────────────────────

mat_ivory_body   = make_pbr('ScooterBody_Ivory', '#EDE9E1', metallic=0.15, roughness=0.18)
mat_dark_trim    = make_pbr('Dark_Trim', '#181A20', metallic=0.3, roughness=0.5)
mat_leather_seat = make_pbr('Seat_Leather', '#141416', metallic=0.05, roughness=0.85)
mat_rubber_tire  = make_pbr('Tire_Rubber', '#111215', metallic=0.02, roughness=0.9)
mat_chrome       = make_pbr('Chrome_Metal', '#D8DEE4', metallic=0.98, roughness=0.08)
mat_dark_alloy   = make_pbr('Alloy_Wheel', '#20232A', metallic=0.9, roughness=0.25)
mat_brake_rotor  = make_pbr('Brake_Rotor', '#8590A0', metallic=0.95, roughness=0.2)
mat_headlight    = make_pbr('Headlight_LED', '#F0F9FF', metallic=0.1, roughness=0.05, emission='#E0F2FE', emission_strength=4.0)
mat_taillight    = make_pbr('Taillight_LED', '#EF4444', metallic=0.1, roughness=0.1, emission='#EF4444', emission_strength=3.5)
mat_mirror_glass = make_pbr('Mirror_Glass', '#A0C4E8', metallic=0.95, roughness=0.02)
mat_display_tft  = make_pbr('TFT_Screen', '#06B6D4', metallic=0.1, roughness=0.1, emission='#06B6D4', emission_strength=2.0)

# Rider materials
mat_helmet_black = make_pbr('Rider_Helmet', '#101114', metallic=0.4, roughness=0.15)
mat_visor_glass  = make_pbr('Rider_Visor', '#08090C', metallic=0.95, roughness=0.05)
mat_jacket_black = make_pbr('Rider_Jacket', '#1E2024', metallic=0.1, roughness=0.75)
mat_jeans_dark   = make_pbr('Rider_Jeans', '#1C222C', metallic=0.05, roughness=0.85)
mat_boots_black  = make_pbr('Rider_Boots', '#121316', metallic=0.2, roughness=0.6)
mat_gloves_black = make_pbr('Rider_Gloves', '#18191C', metallic=0.1, roughness=0.7)

# ── BUILD 3D SCOOTER ──────────────────────────────────────────────────────────

# Front Wheel & Tire
fw_tire = add_torus('Front_Tire', 0.22, 0.055, (0, 0.65, 0.24), rot=(math.pi/2, 0, 0), mat=mat_rubber_tire)
fw_rim = add_cyl('Front_Rim', 0.16, 0.07, (0, 0.65, 0.24), rot=(math.pi/2, 0, 0), mat=mat_dark_alloy)
fw_hub = add_cyl('Front_Hub', 0.06, 0.09, (0, 0.65, 0.24), rot=(math.pi/2, 0, 0), mat=mat_chrome)
fw_disc = add_cyl('Front_BrakeDisc', 0.13, 0.008, (0.05, 0.65, 0.24), rot=(math.pi/2, 0, 0), mat=mat_brake_rotor)

# Front Fender / Mudguard
fender_front = add_sphere('Front_Fender', 0.26, (0, 0.65, 0.32), scale=(0.55, 1.1, 0.55), mat=mat_ivory_body)

# Telescopic Front Forks
for side in [-1, 1]:
    add_cyl(f'Fork_Lower_{side}', 0.02, 0.35, (side * 0.08, 0.61, 0.38), rot=(-0.25, 0, 0), mat=mat_dark_trim)
    add_cyl(f'Fork_Upper_{side}', 0.015, 0.28, (side * 0.08, 0.53, 0.58), rot=(-0.25, 0, 0), mat=mat_chrome)
    add_cyl(f'Fork_Reflector_{side}', 0.012, 0.05, (side * 0.095, 0.62, 0.35), rot=(-0.25, 0, 0), mat=mat_taillight)

# Steering Stem & Handlebar Cowling
add_cyl('Steering_Stem', 0.025, 0.40, (0, 0.45, 0.72), rot=(-0.25, 0, 0), mat=mat_dark_trim)
add_box('Handlebar_Cowl', (0.50, 0.14, 0.10), (0, 0.38, 0.95), rot=(-0.15, 0, 0), mat=mat_dark_trim)
add_box('TFT_Dashboard', (0.16, 0.08, 0.02), (0, 0.35, 0.98), rot=(-0.5, 0, 0), mat=mat_display_tft)

# Left & Right Grips and Mirrors
for side in [-1, 1]:
    add_cyl(f'Grip_{side}', 0.016, 0.12, (side * 0.28, 0.37, 0.95), rot=(0, 0, math.pi/2), mat=mat_rubber_tire)
    add_cyl(f'Brake_Lever_{side}', 0.007, 0.09, (side * 0.24, 0.42, 0.95), rot=(0.3, 0, side * 0.2), mat=mat_chrome)
    # Stalk Mirror
    add_cyl(f'Mirror_Stalk_{side}', 0.005, 0.16, (side * 0.22, 0.40, 1.05), rot=(0.3, side * 0.4, 0), mat=mat_dark_trim)
    add_sphere(f'Mirror_Housing_{side}', 0.065, (side * 0.26, 0.44, 1.15), scale=(1.2, 0.4, 0.8), mat=mat_dark_trim)
    add_sphere(f'Mirror_Glass_{side}', 0.062, (side * 0.26, 0.43, 1.15), scale=(1.15, 0.35, 0.75), mat=mat_mirror_glass)

# Front Shield / Aerodynamic Apron (Matches reference image styling)
apron_main = add_sphere('Front_Apron_Main', 0.32, (0, 0.32, 0.65), scale=(1.1, 0.8, 1.4), mat=mat_ivory_body)
apron_nose = add_sphere('Front_Apron_Nose', 0.24, (0, 0.42, 0.58), scale=(0.9, 0.9, 1.2), mat=mat_ivory_body)
apron_inner = add_box('Front_Inner_Fairing', (0.34, 0.22, 0.45), (0, 0.25, 0.60), rot=(0.2, 0, 0), mat=mat_dark_trim)

# Modern LED Headlight Strip
headlight_main = add_box('LED_Headlight_Strip', (0.28, 0.04, 0.06), (0, 0.45, 0.68), rot=(0.1, 0, 0), mat=mat_headlight)
drl_accent = add_torus('LED_DRL_Surround', 0.12, 0.008, (0, 0.45, 0.68), rot=(0.1, 0, 0), mat=mat_headlight)

# Center Step-Through Tunnel & Floorboard
tunnel = add_box('Central_Tunnel', (0.18, 0.35, 0.22), (0, 0.08, 0.40), rot=(0.1, 0, 0), mat=mat_dark_trim)
floorboard = add_box('Floorboard_Base', (0.42, 0.55, 0.06), (0, -0.05, 0.26), mat=mat_dark_trim)
floor_rubber = add_box('Floorboard_RubberPad', (0.38, 0.50, 0.01), (0, -0.05, 0.295), mat=mat_rubber_tire)

# Main Body Shell / Side Fairings (Cream / Ivory)
body_left = add_sphere('Body_Side_L', 0.28, (-0.12, -0.32, 0.48), scale=(0.55, 1.3, 0.8), mat=mat_ivory_body)
body_right = add_sphere('Body_Side_R', 0.28, (0.12, -0.32, 0.48), scale=(0.55, 1.3, 0.8), mat=mat_ivory_body)
body_center = add_box('Body_Center_Cover', (0.32, 0.62, 0.30), (0, -0.32, 0.46), mat=mat_ivory_body)
body_lower_skirt = add_box('Body_Lower_Skirt', (0.36, 0.65, 0.12), (0, -0.28, 0.30), mat=mat_dark_trim)

# Ergonomic Dual Seat
seat_cushion = add_box('Seat_Main_Cushion', (0.30, 0.68, 0.10), (0, -0.28, 0.65), rot=(-0.05, 0, 0), mat=mat_leather_seat)
seat_contour = add_sphere('Seat_Contour_Rider', 0.18, (0, -0.15, 0.67), scale=(1.0, 1.2, 0.4), mat=mat_leather_seat)
seat_pillion = add_sphere('Seat_Contour_Pillion', 0.18, (0, -0.45, 0.70), scale=(0.95, 1.1, 0.4), mat=mat_leather_seat)

# Passenger Grab Rail
grab_rail_l = add_cyl('Grab_Rail_L', 0.01, 0.35, (-0.16, -0.52, 0.68), rot=(math.pi/2, 0, 0.1), mat=mat_dark_trim)
grab_rail_r = add_cyl('Grab_Rail_R', 0.01, 0.35, (0.16, -0.52, 0.68), rot=(math.pi/2, 0, -0.1), mat=mat_dark_trim)
grab_rail_rear = add_cyl('Grab_Rail_Rear', 0.01, 0.28, (0, -0.68, 0.66), rot=(0, math.pi/2, 0), mat=mat_dark_trim)

# Rear Tail Light & License Plate Holder
tail_light = add_box('TailLight_Bar', (0.24, 0.03, 0.04), (0, -0.65, 0.56), mat=mat_taillight)
license_mount = add_box('License_Mount', (0.14, 0.04, 0.14), (0, -0.72, 0.42), rot=(0.3, 0, 0), mat=mat_dark_trim)
fender_rear = add_sphere('Rear_Fender', 0.25, (0, -0.55, 0.32), scale=(0.55, 1.1, 0.55), mat=mat_dark_trim)

# Rear Wheel & Hub Motor Assembly
rw_tire = add_torus('Rear_Tire', 0.22, 0.06, (0, -0.58, 0.24), rot=(math.pi/2, 0, 0), mat=mat_rubber_tire)
rw_rim = add_cyl('Rear_Rim', 0.16, 0.08, (0, -0.58, 0.24), rot=(math.pi/2, 0, 0), mat=mat_dark_alloy)
rw_motor = add_cyl('Rear_Hub_Motor', 0.14, 0.11, (0, -0.58, 0.24), rot=(math.pi/2, 0, 0), mat=mat_dark_trim)
rw_disc = add_cyl('Rear_Brake_Disc', 0.11, 0.008, (-0.06, -0.58, 0.24), rot=(math.pi/2, 0, 0), mat=mat_brake_rotor)

# Swingarm & Rear Suspension
add_box('Swingarm_Arm', (0.08, 0.40, 0.05), (0.07, -0.42, 0.26), rot=(0.1, 0, 0), mat=mat_dark_trim)
for side in [-1, 1]:
    add_cyl(f'Rear_Shock_{side}', 0.016, 0.26, (side * 0.12, -0.48, 0.42), rot=(0.4, 0, 0), mat=mat_dark_trim)
    add_cyl(f'Rear_Spring_{side}', 0.022, 0.18, (side * 0.12, -0.48, 0.42), rot=(0.4, 0, 0), mat=mat_chrome)

# ── BUILD 3D RIDER (Matches Reference Image) ──────────────────────────────────

# 1. Helmet (Glossy aerodynamic motorcycle helmet)
helmet = add_sphere('Rider_Helmet', 0.13, (0, -0.08, 1.48), scale=(0.95, 1.15, 1.05), mat=mat_helmet_black)
visor = add_sphere('Rider_Visor', 0.128, (0, -0.02, 1.48), scale=(0.92, 0.9, 0.5), mat=mat_visor_glass)

# 2. Neck & Collar
add_cyl('Rider_Neck', 0.055, 0.08, (0, -0.10, 1.36), mat=mat_jacket_black)

# 3. Torso / Motorcycle Jacket (Riding posture)
torso_upper = add_box('Rider_Torso_Upper', (0.34, 0.24, 0.32), (0, -0.12, 1.20), rot=(0.18, 0, 0), mat=mat_jacket_black)
torso_lower = add_box('Rider_Torso_Lower', (0.30, 0.22, 0.28), (0, -0.16, 0.96), rot=(0.12, 0, 0), mat=mat_jacket_black)
jacket_collar = add_torus('Rider_Jacket_Collar', 0.08, 0.02, (0, -0.10, 1.34), rot=(0.18, 0, 0), mat=mat_jacket_black)

# 4. Arms & Gloves (Reaching forward gripping the handlebars)
for side in [-1, 1]:
    # Shoulder
    add_sphere(f'Rider_Shoulder_{side}', 0.075, (side * 0.18, -0.10, 1.26), mat=mat_jacket_black)
    # Upper Arm (angled forward & down)
    add_cyl(f'Rider_UpperArm_{side}', 0.05, 0.26, (side * 0.22, 0.02, 1.16), rot=(0.85, side * 0.25, 0), mat=mat_jacket_black)
    # Elbow joint
    add_sphere(f'Rider_Elbow_{side}', 0.055, (side * 0.25, 0.14, 1.06), mat=mat_jacket_black)
    # Forearm (angled forward towards handlebar grip)
    add_cyl(f'Rider_Forearm_{side}', 0.045, 0.28, (side * 0.26, 0.26, 1.00), rot=(1.35, side * 0.1, 0), mat=mat_jacket_black)
    # Riding Glove gripping handlebar
    add_sphere(f'Rider_Glove_{side}', 0.05, (side * 0.27, 0.37, 0.95), scale=(0.8, 1.2, 0.8), mat=mat_gloves_black)

# 5. Pelvis & Thighs (Seated on scooter)
pelvis = add_box('Rider_Pelvis', (0.28, 0.26, 0.18), (0, -0.22, 0.76), mat=mat_jeans_dark)

for side in [-1, 1]:
    # Hip joint
    add_sphere(f'Rider_Hip_{side}', 0.07, (side * 0.14, -0.20, 0.74), mat=mat_jeans_dark)
    # Thigh (angled forward & slightly down towards floorboard)
    add_cyl(f'Rider_Thigh_{side}', 0.065, 0.36, (side * 0.16, -0.06, 0.65), rot=(1.2, side * 0.15, 0), mat=mat_jeans_dark)
    # Knee
    add_sphere(f'Rider_Knee_{side}', 0.065, (side * 0.18, 0.10, 0.54), mat=mat_jeans_dark)
    # Shin / Calf (angled down towards floorboard)
    add_cyl(f'Rider_Shin_{side}', 0.055, 0.32, (side * 0.17, 0.06, 0.40), rot=(-0.35, 0, 0), mat=mat_jeans_dark)
    # Motorcycle Riding Boot (resting flat on floorboard)
    add_box(f'Rider_Boot_{side}', (0.09, 0.22, 0.08), (side * 0.17, 0.02, 0.30), rot=(-0.05, side * 0.1, 0), mat=mat_boots_black)
    add_sphere(f'Rider_BootToe_{side}', 0.045, (side * 0.17, 0.12, 0.29), scale=(1.0, 1.3, 0.8), mat=mat_boots_black)

# ── EXPORT TO GLB ─────────────────────────────────────────────────────────────

# Select all created objects
bpy.ops.object.select_all(action='SELECT')

# Export for React app
bpy.ops.export_scene.gltf(
    filepath=GLB_REACT,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
    export_materials='EXPORT',
    export_lights=False,
    export_cameras=False,
)

# Also export for frontend/assets
bpy.ops.export_scene.gltf(
    filepath=GLB_FRONTEND,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
    export_materials='EXPORT',
    export_lights=False,
    export_cameras=False,
)

print(f"✅ Successfully exported high-fidelity Scooter + Rider GLB to:\n   {GLB_REACT}\n   {GLB_FRONTEND}")
