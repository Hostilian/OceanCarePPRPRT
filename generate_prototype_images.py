#!/usr/bin/env python3
"""
Generate 6 paper prototype images for OceanCare HCI assignment
Shows the three major tasks with hand-drawn style aesthetics
"""

from PIL import Image, ImageDraw, ImageFont
import numpy as np

def create_paper_texture():
    """Create a subtle paper texture background"""
    width, height = 1200, 800
    # Create a light paper color
    img = Image.new('RGB', (width, height), color=(245, 242, 235))
    pixels = img.load()
    
    # Add subtle noise for paper texture
    for i in range(width):
        for j in range(height):
            if np.random.random() < 0.05:
                noise = np.random.randint(-5, 5)
                r, g, b = img.getpixel((i, j))
                pixels[i, j] = (
                    max(0, min(255, r + noise)),
                    max(0, min(255, g + noise)),
                    max(0, min(255, b + noise))
                )
    return img

def draw_text_with_shadow(draw, text, pos, font_size=20, color=(0, 0, 0), shadow=True):
    """Draw text with optional shadow for paper effect"""
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    if shadow:
        draw.text((pos[0]+2, pos[1]+2), text, font=font, fill=(200, 200, 200))
    draw.text(pos, text, font=font, fill=color)

def image_1_home_screen():
    """Image 1: Task 1 Start - Home Screen with Find Events button"""
    img = create_paper_texture()
    draw = ImageDraw.Draw(img)
    
    # Draw screen frame
    frame_color = (100, 100, 100)
    draw.rectangle([(50, 40), (450, 760)], outline=frame_color, width=3)
    
    # Title
    draw.text((60, 60), "OceanCare App", fill=(0, 102, 204), font=ImageFont.load_default())
    draw.text((60, 90), "HOME SCREEN", fill=(102, 102, 102), font=ImageFont.load_default())
    
    # Navigation bar sketch at bottom
    draw.rectangle([(60, 700), (440, 750)], outline=frame_color, width=2)
    draw.text((80, 710), "Home", fill=(0, 102, 204))
    draw.text((200, 710), "Events", fill=(102, 102, 102))
    draw.text((340, 710), "Profile", fill=(102, 102, 102))
    
    # Main content buttons
    button_y = 150
    button_height = 80
    button_width = 320
    button_x = 70
    
    # "Find Events" button - HIGHLIGHTED
    draw.rectangle(
        [(button_x, button_y), (button_x + button_width, button_y + button_height)],
        outline=(0, 102, 204), width=3, fill=(200, 220, 255)
    )
    draw.text((button_x + 20, button_y + 20), "FIND EVENTS", fill=(0, 102, 204))
    draw.text((button_x + 20, button_y + 50), "[User taps here]", fill=(200, 0, 0))
    
    # Other buttons
    button_y += 120
    draw.rectangle(
        [(button_x, button_y), (button_x + button_width, button_y + button_height)],
        outline=(102, 102, 102), width=2
    )
    draw.text((button_x + 20, button_y + 20), "Report Issue", fill=(102, 102, 102))
    draw.text((button_x + 20, button_y + 50), "Help protect oceans", fill=(150, 150, 150))
    
    button_y += 120
    draw.rectangle(
        [(button_x, button_y), (button_x + button_width, button_y + button_height)],
        outline=(102, 102, 102), width=2
    )
    draw.text((button_x + 20, button_y + 20), "Donate", fill=(102, 102, 102))
    draw.text((button_x + 20, button_y + 50), "Support our mission", fill=(150, 150, 150))
    
    # User persona label
    draw.text((520, 100), "USER: Alex (Volunteer)", fill=(0, 102, 204))
    draw.text((520, 130), "Goal: Find beach cleanup", fill=(102, 102, 102))
    draw.text((520, 160), "events nearby", fill=(102, 102, 102))
    
    # Step annotation
    draw.text((520, 250), "TASK 1 - STEP 1:", fill=(0, 0, 0))
    draw.text((520, 280), "Home Screen", fill=(102, 102, 102))
    draw.text((520, 310), "User sees navigation menu", fill=(102, 102, 102))
    draw.text((520, 340), "with 'Find Events' option", fill=(102, 102, 102))
    
    # Arrow pointing to button
    draw.text((420, 190), "→", fill=(200, 0, 0))
    
    img.save('prototype_1_home_screen.png')
    print("✓ Image 1 created: prototype_1_home_screen.png")

def image_2_events_and_confirmation():
    """Image 2: Task 1 End - Events Screen with Confirmation Pop-up overlay"""
    img = create_paper_texture()
    draw = ImageDraw.Draw(img)
    
    # Draw main screen frame (Events List)
    frame_color = (100, 100, 100)
    draw.rectangle([(50, 40), (450, 760)], outline=frame_color, width=3)
    draw.text((60, 60), "OceanCare App", fill=(0, 102, 204))
    draw.text((60, 90), "CLEANUP EVENTS", fill=(102, 102, 102))
    
    # Events list
    event_y = 140
    draw.rectangle([(70, event_y), (430, event_y + 70)], outline=(102, 102, 102), width=1)
    draw.text((80, event_y + 10), "Ocean Beach Cleanup", fill=(0, 102, 204))
    draw.text((80, event_y + 35), "Saturday 2PM • 15 volunteers", fill=(102, 102, 102))
    draw.text((350, event_y + 25), "[JOIN]", fill=(0, 150, 0))
    
    # Draw confirmation pop-up overlay (slightly offset to show layering)
    popup_x, popup_y = 130, 180
    popup_width, popup_height = 280, 200
    
    # Pop-up shadow
    draw.rectangle(
        [(popup_x + 5, popup_y + 5), (popup_x + popup_width + 5, popup_y + popup_height + 5)],
        fill=(200, 200, 200), outline=None
    )
    
    # Pop-up background
    draw.rectangle(
        [(popup_x, popup_y), (popup_x + popup_width, popup_y + popup_height)],
        fill=(255, 255, 255), outline=(50, 50, 50), width=3
    )
    
    # Pop-up content
    draw.text((popup_x + 20, popup_y + 20), "CONFIRM REGISTRATION", fill=(0, 102, 204))
    draw.text((popup_x + 20, popup_y + 50), "Join Ocean Beach", fill=(50, 50, 50))
    draw.text((popup_x + 20, popup_y + 70), "Cleanup?", fill=(50, 50, 50))
    
    # Pop-up buttons
    draw.rectangle(
        [(popup_x + 20, popup_y + 110), (popup_x + 130, popup_y + 150)],
        outline=(0, 102, 204), width=2, fill=(200, 220, 255)
    )
    draw.text((popup_x + 35, popup_y + 120), "Confirm", fill=(0, 102, 204))
    
    draw.rectangle(
        [(popup_x + 150, popup_y + 110), (popup_x + 260, popup_y + 150)],
        outline=(102, 102, 102), width=2
    )
    draw.text((popup_x + 165, popup_y + 120), "Cancel", fill=(102, 102, 102))
    
    # Annotation
    draw.text((520, 100), "TASK 1 - STEP 2:", fill=(0, 0, 0))
    draw.text((520, 130), "Events Screen", fill=(102, 102, 102))
    draw.text((520, 160), "User selects event and", fill=(102, 102, 102))
    draw.text((520, 190), "paper pop-up appears", fill=(102, 102, 102))
    draw.text((520, 220), "(separate paper cutout)", fill=(200, 0, 0))
    
    draw.text((520, 280), "User action:", fill=(0, 0, 0))
    draw.text((520, 310), "- User taps 'Join'", fill=(102, 102, 102))
    draw.text((520, 340), "- Pop-up placed on top", fill=(102, 102, 102))
    draw.text((520, 370), "- User confirms registration", fill=(102, 102, 102))
    
    # Arrow showing pop-up placement
    draw.text((480, 350), "pop-up", fill=(200, 0, 0))
    draw.text((470, 370), "overlay", fill=(200, 0, 0))
    
    img.save('prototype_2_events_confirmation.png')
    print("✓ Image 2 created: prototype_2_events_confirmation.png")

def image_3_report_form_blank():
    """Image 3: Task 2 Start - Blank Report Issue Form"""
    img = create_paper_texture()
    draw = ImageDraw.Draw(img)
    
    # Draw screen frame
    frame_color = (100, 100, 100)
    draw.rectangle([(50, 40), (450, 760)], outline=frame_color, width=3)
    draw.text((60, 60), "OceanCare App", fill=(0, 102, 204))
    draw.text((60, 90), "REPORT ISSUE", fill=(102, 102, 102))
    
    # Form fields
    form_y = 140
    form_x = 70
    
    # Photo area
    draw.rectangle([(form_x, form_y), (form_x + 360, form_y + 100)],
                   outline=(102, 102, 102), width=2, fill=(240, 240, 240))
    draw.text((form_x + 100, form_y + 35), "[TAP TO ADD PHOTO]", fill=(102, 102, 102))
    
    # Location field
    form_y += 130
    draw.text((form_x, form_y), "Location:", fill=(50, 50, 50))
    draw.rectangle([(form_x, form_y + 25), (form_x + 360, form_y + 50)],
                   outline=(102, 102, 102), width=1, fill=(255, 255, 255))
    draw.text((form_x + 10, form_y + 30), "GPS: _____________", fill=(150, 150, 150))
    
    # Description field
    form_y += 80
    draw.text((form_x, form_y), "Description:", fill=(50, 50, 50))
    draw.rectangle([(form_x, form_y + 25), (form_x + 360, form_y + 100)],
                   outline=(102, 102, 102), width=1, fill=(255, 255, 255))
    draw.text((form_x + 10, form_y + 30), "[User writes here]", fill=(150, 150, 150))
    
    # Submit button
    form_y += 120
    draw.rectangle([(form_x, form_y), (form_x + 360, form_y + 50)],
                   outline=(0, 102, 204), width=2, fill=(200, 220, 255))
    draw.text((form_x + 120, form_y + 15), "SUBMIT REPORT", fill=(0, 102, 204))
    
    # Annotation
    draw.text((520, 100), "USER: Maria (Concerned)", fill=(0, 102, 204))
    draw.text((520, 130), "Goal: Report beach debris", fill=(102, 102, 102))
    
    draw.text((520, 200), "TASK 2 - STEP 1:", fill=(0, 0, 0))
    draw.text((520, 230), "Blank Report Form", fill=(102, 102, 102))
    draw.text((520, 260), "User navigates to", fill=(102, 102, 102))
    draw.text((520, 290), "Report Issue screen", fill=(102, 102, 102))
    
    draw.text((520, 350), "Interactive elements:", fill=(0, 0, 0))
    draw.text((520, 380), "- Photo upload area", fill=(102, 102, 102))
    draw.text((520, 410), "- Location input (GPS)", fill=(102, 102, 102))
    draw.text((520, 440), "- Text description box", fill=(102, 102, 102))
    draw.text((520, 470), "- Submit button", fill=(102, 102, 102))
    
    img.save('prototype_3_report_form_blank.png')
    print("✓ Image 3 created: prototype_3_report_form_blank.png")

def image_4_report_form_filled():
    """Image 4: Task 2 End - Filled Report with sketch"""
    img = create_paper_texture()
    draw = ImageDraw.Draw(img)
    
    # Draw screen frame
    frame_color = (100, 100, 100)
    draw.rectangle([(50, 40), (450, 760)], outline=frame_color, width=3)
    draw.text((60, 60), "OceanCare App", fill=(0, 102, 204))
    draw.text((60, 90), "REPORT ISSUE", fill=(102, 102, 102))
    
    # Form fields
    form_y = 140
    form_x = 70
    
    # Photo area - with sketch
    draw.rectangle([(form_x, form_y), (form_x + 360, form_y + 100)],
                   outline=(102, 102, 102), width=2, fill=(240, 240, 240))
    
    # Draw simple trash sketch
    trash_x, trash_y = form_x + 120, form_y + 30
    draw.line([(trash_x, trash_y), (trash_x + 40, trash_y)], fill=(50, 50, 50), width=2)
    draw.line([(trash_x + 5, trash_y), (trash_x + 5, trash_y + 30)], fill=(50, 50, 50), width=2)
    draw.line([(trash_x + 20, trash_y), (trash_x + 20, trash_y + 30)], fill=(50, 50, 50), width=2)
    draw.line([(trash_x + 35, trash_y), (trash_x + 35, trash_y + 30)], fill=(50, 50, 50), width=2)
    draw.text((trash_x + 50, trash_y + 10), "Plastic", fill=(50, 50, 50))
    
    # Location field - filled
    form_y += 130
    draw.text((form_x, form_y), "Location:", fill=(50, 50, 50))
    draw.rectangle([(form_x, form_y + 25), (form_x + 360, form_y + 50)],
                   outline=(102, 102, 102), width=1, fill=(255, 255, 255))
    draw.text((form_x + 10, form_y + 30), "Sandy Beach, CA (37.5°N)", fill=(50, 50, 50))
    
    # Description field - filled
    form_y += 80
    draw.text((form_x, form_y), "Description:", fill=(50, 50, 50))
    draw.rectangle([(form_x, form_y + 25), (form_x + 360, form_y + 100)],
                   outline=(102, 102, 102), width=1, fill=(255, 255, 255))
    draw.text((form_x + 10, form_y + 30), "Large pile of plastic", fill=(50, 50, 50))
    draw.text((form_x + 10, form_y + 55), "bags and bottles.", fill=(50, 50, 50))
    draw.text((form_x + 10, form_y + 75), "~50 pieces", fill=(50, 50, 50))
    
    # Submit button - ready to click
    form_y += 120
    draw.rectangle([(form_x, form_y), (form_x + 360, form_y + 50)],
                   outline=(0, 150, 0), width=3, fill=(200, 255, 200))
    draw.text((form_x + 100, form_y + 15), "SUBMIT REPORT", fill=(0, 150, 0))
    
    # Annotation
    draw.text((520, 100), "TASK 2 - STEP 2:", fill=(0, 0, 0))
    draw.text((520, 130), "Form Completed", fill=(102, 102, 102))
    draw.text((520, 160), "User fills in all fields:", fill=(102, 102, 102))
    
    draw.text((520, 200), "- Photo: (trash sketch)", fill=(102, 102, 102))
    draw.text((520, 230), "- Location: Sandy Beach", fill=(102, 102, 102))
    draw.text((520, 260), "- Description: ~50 pieces", fill=(102, 102, 102))
    
    draw.text((520, 320), "User action:", fill=(0, 0, 0))
    draw.text((520, 350), "- Taps 'Submit Report'", fill=(102, 102, 102))
    draw.text((520, 380), "- Form validates & sends", fill=(102, 102, 102))
    draw.text((520, 410), "- Success confirmation", fill=(0, 150, 0))
    
    img.save('prototype_4_report_form_filled.png')
    print("✓ Image 4 created: prototype_4_report_form_filled.png")

def image_5_donate_screen():
    """Image 5: Task 3 Start - Donate Screen with $20 selected"""
    img = create_paper_texture()
    draw = ImageDraw.Draw(img)
    
    # Draw screen frame
    frame_color = (100, 100, 100)
    draw.rectangle([(50, 40), (450, 760)], outline=frame_color, width=3)
    draw.text((60, 60), "OceanCare App", fill=(0, 102, 204))
    draw.text((60, 90), "DONATE", fill=(102, 102, 102))
    
    # Campaign title
    draw.text((70, 130), "Save the Turtles Campaign", fill=(0, 102, 204))
    draw.text((70, 155), "Help rescue marine life", fill=(102, 102, 102))
    
    # Donation amount buttons
    amounts = ["$5", "$10", "$20", "$50"]
    button_y = 210
    button_height = 60
    
    for i, amount in enumerate(amounts):
        button_y_pos = button_y + (i * 90)
        
        if amount == "$20":  # Highlighted
            draw.rectangle(
                [(70, button_y_pos), (380, button_y_pos + button_height)],
                outline=(0, 150, 0), width=3, fill=(200, 255, 200)
            )
            draw.text((100, button_y_pos + 15), amount, fill=(0, 150, 0))
            draw.text((150, button_y_pos + 15), "← SELECTED", fill=(0, 150, 0))
        else:
            draw.rectangle(
                [(70, button_y_pos), (380, button_y_pos + button_height)],
                outline=(102, 102, 102), width=2
            )
            draw.text((100, button_y_pos + 15), amount, fill=(102, 102, 102))
    
    # Donate Now button
    donate_y = 595
    draw.rectangle(
        [(70, donate_y), (380, donate_y + 60)],
        outline=(0, 102, 204), width=2, fill=(200, 220, 255)
    )
    draw.text((130, donate_y + 15), "DONATE NOW", fill=(0, 102, 204))
    
    # Annotation
    draw.text((520, 100), "USER: John (Donor)", fill=(0, 102, 204))
    draw.text((520, 130), "Goal: Donate $20 to", fill=(102, 102, 102))
    draw.text((520, 160), "turtle conservation", fill=(102, 102, 102))
    
    draw.text((520, 220), "TASK 3 - STEP 1:", fill=(0, 0, 0))
    draw.text((520, 250), "Donation Screen", fill=(102, 102, 102))
    draw.text((520, 280), "User selects amount:", fill=(102, 102, 102))
    draw.text((520, 310), "- $5, $10, $20, $50", fill=(102, 102, 102))
    
    draw.text((520, 360), "User action:", fill=(0, 0, 0))
    draw.text((520, 390), "- Taps $20 (highlighted)", fill=(102, 102, 102))
    draw.text((520, 420), "- Button shows selection", fill=(102, 102, 102))
    draw.text((520, 450), "- Ready to donate", fill=(102, 102, 102))
    
    img.save('prototype_5_donate_screen.png')
    print("✓ Image 5 created: prototype_5_donate_screen.png")

def image_6_thank_you_popup():
    """Image 6: Task 3 End - Thank You Pop-up overlay"""
    img = create_paper_texture()
    draw = ImageDraw.Draw(img)
    
    # Draw main screen frame (Donate Screen in background)
    frame_color = (100, 100, 100)
    draw.rectangle([(50, 40), (450, 760)], outline=frame_color, width=3)
    draw.text((60, 60), "OceanCare App", fill=(0, 102, 204))
    draw.text((60, 90), "DONATE", fill=(102, 102, 102))
    
    # Background donate screen (faded)
    draw.text((70, 130), "Save the Turtles Campaign", fill=(200, 200, 200))
    draw.rectangle([(70, 210), (380, 270)], outline=(200, 200, 200), width=2, fill=(240, 240, 240))
    draw.text((100, 220), "$20  ✓", fill=(200, 200, 200))
    
    # Draw thank you pop-up overlay (offset to show layering)
    popup_x, popup_y = 120, 230
    popup_width, popup_height = 260, 220
    
    # Pop-up shadow
    draw.rectangle(
        [(popup_x + 5, popup_y + 5), (popup_x + popup_width + 5, popup_y + popup_height + 5)],
        fill=(200, 200, 200), outline=None
    )
    
    # Pop-up background
    draw.rectangle(
        [(popup_x, popup_y), (popup_x + popup_width, popup_y + popup_height)],
        fill=(255, 255, 255), outline=(50, 50, 50), width=3
    )
    
    # Pop-up content
    draw.text((popup_x + 30, popup_y + 20), "THANK YOU!", fill=(0, 150, 0))
    draw.text((popup_x + 20, popup_y + 55), "Your $20 donation", fill=(50, 50, 50))
    draw.text((popup_x + 20, popup_y + 75), "has been received!", fill=(50, 50, 50))
    
    draw.text((popup_x + 20, popup_y + 110), "Impact: Saves 5 sea", fill=(102, 102, 102))
    draw.text((popup_x + 20, popup_y + 130), "turtles from plastic", fill=(102, 102, 102))
    
    # Pop-up button
    draw.rectangle(
        [(popup_x + 35, popup_y + 155), (popup_x + 225, popup_y + 190)],
        outline=(0, 102, 204), width=2, fill=(200, 220, 255)
    )
    draw.text((popup_x + 65, popup_y + 162), "Done", fill=(0, 102, 204))
    
    # Annotation
    draw.text((520, 100), "TASK 3 - STEP 2:", fill=(0, 0, 0))
    draw.text((520, 130), "Confirmation Pop-up", fill=(102, 102, 102))
    draw.text((520, 160), "User taps 'Donate Now'", fill=(102, 102, 102))
    draw.text((520, 190), "and pop-up appears", fill=(102, 102, 102))
    draw.text((520, 220), "(separate paper cutout)", fill=(200, 0, 0))
    
    draw.text((520, 280), "Pop-up shows:", fill=(0, 0, 0))
    draw.text((520, 310), "- Donation confirmation", fill=(102, 102, 102))
    draw.text((520, 340), "- Impact message", fill=(102, 102, 102))
    draw.text((520, 370), "- 'Done' button to close", fill=(102, 102, 102))
    
    draw.text((520, 420), "Result: User confirms", fill=(0, 150, 0))
    draw.text((520, 450), "donation complete", fill=(0, 150, 0))
    
    img.save('prototype_6_thank_you_popup.png')
    print("✓ Image 6 created: prototype_6_thank_you_popup.png")

if __name__ == '__main__':
    print("Generating 6 OceanCare Paper Prototype Images...")
    print("=" * 60)
    
    image_1_home_screen()
    image_2_events_and_confirmation()
    image_3_report_form_blank()
    image_4_report_form_filled()
    image_5_donate_screen()
    image_6_thank_you_popup()
    
    print("=" * 60)
    print("✓ All 6 images created successfully!")
    print("\nImages saved to current directory:")
    print("  1. prototype_1_home_screen.png")
    print("  2. prototype_2_events_confirmation.png")
    print("  3. prototype_3_report_form_blank.png")
    print("  4. prototype_4_report_form_filled.png")
    print("  5. prototype_5_donate_screen.png")
    print("  6. prototype_6_thank_you_popup.png")
