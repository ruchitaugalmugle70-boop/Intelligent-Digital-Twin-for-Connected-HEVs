"""
Blender 5.x Photorealistic E-TWIN Scooter Generator & GLB Exporter
Creates a detailed, high-resolution 3D Electric Scooter with PBR materials,
smooth surfaces, realistic real-world proportions, and named sub-assemblies.
"""

import bpy
import bmesh
import math
import os

# Clean factory state
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
GLB_TARGET = os.path.join(OUTPUT_DIR, '..', 'frontend-react', 'public', 'assets', 'models', 'etwin_scooter.glb')
os.makedirs(os.path.dirname(GLB_TARGET), exist_ok=True)

# ── PBR MATERIAL CREATION ───────────────────────────────────────────────────

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) / 255.0 for i in (0, 2, 4))

def make_pbr(name, color, metallic=0.0, roughness=0.5, clearcoat=0.0, emission=None, emission_strength=0.0, transmission=0.0, ior=1.45):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    if bsdf is None:
        bsdf = mat.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
    
    r, g, b = hex_to_rgb(color)
    bsdf.inputs['Base Color'].default_value = (r, g, b, 1.0)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    
    # Clearcoat (in Blender 4/5 it's 'Coat Weight')
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = clearcoat
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = clearcoat
        
    if 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in bsdf.inputs:
        bsdf.inputs['Transmission'].default_value = transmission

    if 'IOR' in bsdf.inputs:
        bsdf.inputs['IOR'].default_value = ior

    if emission and emission_strength > 0:
        er, eg, eb = hex_to_rgb(emission)
        if 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = (er, eg, eb, 1.0)
            bsdf.inputs['Emission Strength'].default_value = emission_strength

    return mat

def apply_mat(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

def set_smooth_and_bevel(obj, bevel_width=0.005, subsurf_levels=1):
    for poly in obj.data.polygons:
        poly.use_smooth = True
    
    # Add Bevel modifier for realistic rounded edges
    if bevel_width > 0:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = bevel_width
        bev.segments = 2
        bev.limit_method = 'ANGLE'

# ── CREATE MATERIALS ────────────────────────────────────────────────────────

# Automotive Clearcoat Body (Paintable)
mat_body_ivory   = make_pbr('Body_Paint_Ivory', '#EDE9E1', metallic=0.15, roughness=0.15, clearcoat=0.9)
mat_dark_trim    = make_pbr('Body_Matte_Trim', '#181A20', metallic=0.25, roughness=0.55)
mat_gloss_black  = make_pbr('Body_Gloss_Black', '#0C0D10', metallic=0.3, roughness=0.1, clearcoat=0.8)

# Mechanical & Metals
mat_chrome       = make_pbr('Metal_Chrome', '#DCE2E8', metallic=0.98, roughness=0.06)
mat_dark_alloy   = make_pbr('Metal_Dark_Alloy', '#22252D', metallic=0.88, roughness=0.22)
mat_brake_rotor  = make_pbr('Metal_Brake_Steel', '#8E99A8', metallic=0.92, roughness=0.18)
mat_rubber_tire  = make_pbr('Rubber_Tread', '#121316', metallic=0.01, roughness=0.88)
mat_seat_leather = make_pbr('Leather_Seat', '#15161A', metallic=0.02, roughness=0.82)
mat_mirror_glass = make_pbr('Glass_Mirror', '#98BDE6', metallic=0.96, roughness=0.02)

# Lights & Displays
mat_headlight_led = make_pbr('LED_Headlight', '#F0F9FF', metallic=0.1, roughness=0.05, emission='#E0F2FE', emission_strength=4.5)
mat_taillight_led = make_pbr('LED_Taillight', '#EF4444', metallic=0.1, roughness=0.1, emission='#EF4444', emission_strength=4.0)
mat_indicator_led = make_pbr('LED_Indicator', '#F59E0B', metallic=0.1, roughness=0.1, emission='#F59E0B', emission_strength=3.0)
mat_tft_screen    = make_pbr('Screen_TFT', '#06B6D4', metallic=0.1, roughness=0.1, emission='#06B6D4', emission_strength=2.5)

# CAD Internal Components
mat_cad_battery = make_pbr('CAD_Battery_LiIon', '#10B981', metallic=0.5, roughness=0.3, emission='#059669', emission_strength=0.8)
mat_cad_bms     = make_pbr('CAD_BMS_Module', '#F59E0B', metallic=0.6, roughness=0.3, emission='#D97706', emission_strength=0.6)
mat_cad_ecu     = make_pbr('CAD_ECU_Inverter', '#0284C7', metallic=0.7, roughness=0.2, emission='#0369A1', emission_strength=0.6)
mat_cad_motor   = make_pbr('CAD_Motor_PMSM', '#EF4444', metallic=0.85, roughness=0.2, emission='#B91C1C', emission_strength=0.8)
mat_cad_susp    = make_pbr('CAD_Suspension', '#A855F7', metallic=0.8, roughness=0.2, emission='#7E22CE', emission_strength=0.5)
mat_cad_wiring  = make_pbr('CAD_Wiring_Harness', '#F97316', metallic=0.3, roughness=0.4, emission='#C2410C', emission_strength=0.6)

# ── HELPER PRIMITIVES WITH BEVELS ───────────────────────────────────────────

def add_box(name, size, loc, rot=(0,0,0), mat=None, bevel=0.005):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (size[0], size[1], size[2])
    bpy.ops.object.transform_apply(scale=True, rotation=False, location=False)
    set_smooth_and_bevel(obj, bevel_width=bevel)
    if mat: apply_mat(obj, mat)
    return obj

def add_cyl(name, r, depth, loc, rot=(0,0,0), mat=None, segs=48, bevel=0.003):
    bpy.ops.mesh.primitive_cylinder_add(vertices=segs, radius=r, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    set_smooth_and_bevel(obj, bevel_width=bevel)
    if mat: apply_mat(obj, mat)
    return obj

def add_torus(name, maj_r, min_r, loc, rot=(0,0,0), mat=None, maj_segs=64, min_segs=32):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=maj_r, minor_radius=min_r,
        major_segments=maj_segs, minor_segments=min_segs,
        location=loc, rotation=rot
    )
    obj = bpy.context.active_object
    obj.name = name
    for poly in obj.data.polygons: poly.use_smooth = True
    if mat: apply_mat(obj, mat)
    return obj

def add_sphere(name, radius, loc, scale=(1,1,1), mat=None, segs=36):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, segments=segs, ring_count=segs//2, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(scale=True, rotation=False, location=False)
    for poly in obj.data.polygons: poly.use_smooth = True
    if mat: apply_mat(obj, mat)
    return obj

# ── BUILD THE REALISTIC SCOOTER ─────────────────────────────────────────────

# 1. FRONT WHEEL ASSEMBLY (Y = +0.65m)
add_torus('Wheel_Front_Tire', 0.22, 0.055, (0, 0.65, 0.24), rot=(math.pi/2, 0, 0), mat=mat_rubber_tire)
add_cyl('Wheel_Front_Rim', 0.165, 0.065, (0, 0.65, 0.24), rot=(math.pi/2, 0, 0), mat=mat_dark_alloy)
add_cyl('Wheel_Front_Axle', 0.012, 0.18, (0, 0.65, 0.24), rot=(math.pi/2, 0, 0), mat=mat_chrome)
add_cyl('Wheel_Front_BrakeDisc', 0.13, 0.007, (0.05, 0.65, 0.24), rot=(math.pi/2, 0, 0), mat=mat_brake_rotor)
add_box('Wheel_Front_Caliper', (0.04, 0.07, 0.06), (0.06, 0.60, 0.30), mat=mat_gloss_black)

# Front 5-spoke alloy pattern
for i in range(5):
    ang = i * (2 * math.pi / 5)
    add_box(f'Wheel_Front_Spoke_{i}', (0.01, 0.12, 0.02), 
            (0, 0.65 + math.cos(ang)*0.075, 0.24 + math.sin(ang)*0.075),
            rot=(ang, 0, 0), mat=mat_dark_alloy, bevel=0.002)

# 2. FRONT FENDER / MUDGUARD (Paintable Body)
add_sphere('Body_Fender_Front', 0.26, (0, 0.65, 0.32), scale=(0.52, 1.15, 0.52), mat=mat_body_ivory)

# 3. TELESCOPIC FRONT FORKS & SUSPENSION
for side in [-1, 1]:
    add_cyl(f'Fork_Lower_{side}', 0.022, 0.36, (side * 0.08, 0.61, 0.38), rot=(-0.25, 0, 0), mat=mat_dark_trim)
    add_cyl(f'Fork_Upper_{side}', 0.016, 0.30, (side * 0.08, 0.52, 0.60), rot=(-0.25, 0, 0), mat=mat_chrome)
    add_box(f'Fork_Reflector_{side}', (0.008, 0.02, 0.05), (side * 0.10, 0.62, 0.36), rot=(-0.25, 0, 0), mat=mat_indicator_led)

add_box('Steering_TripleTree', (0.22, 0.05, 0.04), (0, 0.46, 0.72), rot=(-0.25, 0, 0), mat=mat_dark_trim)
add_cyl('Steering_Stem', 0.024, 0.38, (0, 0.42, 0.78), rot=(-0.25, 0, 0), mat=mat_dark_trim)

# 4. AERODYNAMIC FRONT APRON & COWL (Paintable Body)
add_sphere('Body_Front_Apron_Main', 0.34, (0, 0.32, 0.66), scale=(1.12, 0.85, 1.45), mat=mat_body_ivory)
add_sphere('Body_Front_Nose_Cone', 0.25, (0, 0.44, 0.58), scale=(0.92, 0.95, 1.25), mat=mat_body_ivory)
add_box('Body_Front_Inner_Trim', (0.34, 0.24, 0.48), (0, 0.24, 0.60), rot=(0.2, 0, 0), mat=mat_dark_trim)

# 5. INTEGRATED HORIZONTAL LED HEADLIGHT & DRL
add_box('Light_Headlight_Main', (0.28, 0.04, 0.06), (0, 0.46, 0.68), rot=(0.1, 0, 0), mat=mat_headlight_led)
add_torus('Light_DRL_Surround', 0.13, 0.008, (0, 0.46, 0.68), rot=(0.1, 0, 0), mat=mat_headlight_led)
for side in [-1, 1]:
    add_sphere(f'Light_Indicator_Front_{side}', 0.018, (side * 0.20, 0.40, 0.72), mat=mat_indicator_led)

# 6. HANDLEBAR COCKPIT & CONTROLS
add_box('Handlebar_Cockpit_Cowl', (0.52, 0.14, 0.10), (0, 0.36, 0.96), rot=(-0.15, 0, 0), mat=mat_dark_trim)
add_box('Dashboard_TFT_Screen', (0.16, 0.08, 0.02), (0, 0.33, 0.99), rot=(-0.5, 0, 0), mat=mat_tft_screen)

for side in [-1, 1]:
    add_cyl(f'Handlebar_Grip_{side}', 0.016, 0.12, (side * 0.28, 0.35, 0.96), rot=(0, 0, math.pi/2), mat=mat_rubber_tire)
    add_cyl(f'Brake_Lever_{side}', 0.006, 0.10, (side * 0.24, 0.40, 0.96), rot=(0.3, 0, side * 0.2), mat=mat_chrome)
    # Stalk mirror
    add_cyl(f'Mirror_Stalk_{side}', 0.005, 0.16, (side * 0.22, 0.38, 1.06), rot=(0.3, side * 0.4, 0), mat=mat_dark_trim)
    add_sphere(f'Mirror_Housing_{side}', 0.065, (side * 0.26, 0.42, 1.16), scale=(1.2, 0.4, 0.8), mat=mat_gloss_black)
    add_sphere(f'Mirror_Glass_{side}', 0.062, (side * 0.26, 0.415, 1.16), scale=(1.15, 0.35, 0.75), mat=mat_mirror_glass)

# 7. CHASSIS, TUNNEL & STEP-THROUGH FLOORBOARD
add_box('Chassis_Central_Tunnel', (0.18, 0.36, 0.24), (0, 0.08, 0.40), rot=(0.1, 0, 0), mat=mat_dark_trim)
add_box('Chassis_Floorboard_Base', (0.44, 0.58, 0.06), (0, -0.05, 0.26), mat=mat_dark_trim)
add_box('Chassis_Floorboard_Pad', (0.40, 0.52, 0.012), (0, -0.05, 0.295), mat=mat_rubber_tire)

# 8. REAR BODYWORK & SIDE PANELS (Paintable Body)
add_sphere('Body_Side_Panel_L', 0.28, (-0.12, -0.32, 0.48), scale=(0.58, 1.35, 0.82), mat=mat_body_ivory)
add_sphere('Body_Side_Panel_R', 0.28, (0.12, -0.32, 0.48), scale=(0.58, 1.35, 0.82), mat=mat_body_ivory)
add_box('Body_Center_Cover', (0.32, 0.65, 0.32), (0, -0.32, 0.46), mat=mat_body_ivory)
add_box('Body_Lower_Skirt', (0.38, 0.68, 0.12), (0, -0.28, 0.30), mat=mat_dark_trim)

# 9. CONTOURED DUAL SEAT
add_box('Seat_Base_Cushion', (0.30, 0.70, 0.10), (0, -0.28, 0.65), rot=(-0.05, 0, 0), mat=mat_seat_leather)
add_sphere('Seat_Contour_Rider', 0.18, (0, -0.15, 0.68), scale=(1.0, 1.25, 0.42), mat=mat_seat_leather)
add_sphere('Seat_Contour_Pillion', 0.18, (0, -0.45, 0.71), scale=(0.95, 1.15, 0.42), mat=mat_seat_leather)

# 10. PASSENGER GRAB RAILS & TAIL LIGHT ASSEMBLY
for side in [-1, 1]:
    add_cyl(f'Grab_Rail_Side_{side}', 0.01, 0.36, (side * 0.16, -0.52, 0.68), rot=(math.pi/2, 0, side * 0.1), mat=mat_dark_trim)
add_cyl('Grab_Rail_Cross', 0.01, 0.28, (0, -0.68, 0.66), rot=(0, math.pi/2, 0), mat=mat_dark_trim)

add_box('Light_Taillight_Bar', (0.24, 0.03, 0.04), (0, -0.66, 0.56), mat=mat_taillight_led)
for side in [-1, 1]:
    add_sphere(f'Light_Indicator_Rear_{side}', 0.014, (side * 0.15, -0.64, 0.56), mat=mat_indicator_led)

add_box('Tail_License_Mount', (0.14, 0.04, 0.14), (0, -0.72, 0.42), rot=(0.3, 0, 0), mat=mat_dark_trim)
add_sphere('Body_Fender_Rear', 0.26, (0, -0.56, 0.32), scale=(0.54, 1.15, 0.54), mat=mat_dark_trim)

# 11. REAR WHEEL & PMSM HUB MOTOR ASSEMBLY (Y = -0.58m)
add_torus('Wheel_Rear_Tire', 0.22, 0.06, (0, -0.58, 0.24), rot=(math.pi/2, 0, 0), mat=mat_rubber_tire)
add_cyl('Wheel_Rear_Rim', 0.165, 0.08, (0, -0.58, 0.24), rot=(math.pi/2, 0, 0), mat=mat_dark_alloy)
add_cyl('Wheel_Rear_Hub_Motor', 0.145, 0.11, (0, -0.58, 0.24), rot=(math.pi/2, 0, 0), mat=mat_cad_motor)
add_cyl('Wheel_Rear_BrakeDisc', 0.11, 0.007, (-0.065, -0.58, 0.24), rot=(math.pi/2, 0, 0), mat=mat_brake_rotor)

# 12. SWINGARM & DUAL REAR SUSPENSION SHOCKS
add_box('Chassis_Swingarm_Arm', (0.08, 0.42, 0.05), (0.07, -0.42, 0.26), rot=(0.1, 0, 0), mat=mat_dark_trim)
for side in [-1, 1]:
    add_cyl(f'Suspension_Rear_Damper_{side}', 0.016, 0.28, (side * 0.12, -0.48, 0.42), rot=(0.4, 0, 0), mat=mat_cad_susp)
    add_cyl(f'Suspension_Rear_Coil_{side}', 0.022, 0.20, (side * 0.12, -0.48, 0.42), rot=(0.4, 0, 0), mat=mat_chrome)

# 13. INTERNAL CAD MODULES (Battery, BMS, ECU, Wiring)
add_box('CAD_Internal_BatteryPack', (0.24, 0.42, 0.16), (0, -0.15, 0.42), mat=mat_cad_battery)
add_box('CAD_Internal_BMS', (0.14, 0.10, 0.04), (0, -0.05, 0.52), mat=mat_cad_bms)
add_box('CAD_Internal_ECU_Controller', (0.16, 0.14, 0.08), (0, -0.38, 0.42), mat=mat_cad_ecu)
add_cyl('CAD_Internal_MainHarness', 0.012, 0.70, (0.05, -0.15, 0.45), rot=(math.pi/2, 0, 0), mat=mat_cad_wiring)

# ── EXPORT TO GLB ───────────────────────────────────────────────────────────

bpy.ops.object.select_all(action='SELECT')

bpy.ops.export_scene.gltf(
    filepath=GLB_TARGET,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
    export_materials='EXPORT',
    export_lights=False,
    export_cameras=False,
)

print(f"✅ Successfully exported Realistic E-TWIN Scooter GLB to:\n   {GLB_TARGET}")
