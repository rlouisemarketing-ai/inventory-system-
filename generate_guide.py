#!/usr/bin/env python3
"""
Generate guide_updated.pdf using ReportLab.
Professional 2-page inventory app user guide.
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus.flowables import Flowable
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
import os

# ── Color palette ──────────────────────────────────────────────────
DARK_BLUE   = HexColor('#2C5282')
ACCENT_BLUE = HexColor('#5B99D9')
BODY_TEXT   = HexColor('#2C2C2C')
CALLOUT_BLUE  = HexColor('#EBF4FF')
CALLOUT_AMBER = HexColor('#FFFBEB')
DIVIDER     = HexColor('#E2E8F0')
WHITE       = colors.white
BLACK       = colors.black
LIGHT_CARD  = HexColor('#F7FAFC')

OUTPUT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'guide_updated.pdf')

PAGE_W, PAGE_H = letter   # 612 x 792
MARGIN = 0.55 * inch
CONTENT_W = PAGE_W - 2 * MARGIN


# ── Custom flowables ───────────────────────────────────────────────

class HeaderBlock(Flowable):
    """Full-width dark-blue header with app title, subtitle, and description."""
    HEIGHT = 1.45 * inch

    def __init__(self):
        Flowable.__init__(self)
        self.width = PAGE_W
        self.height = self.HEIGHT

    def draw(self):
        c = self.canv
        # Background rectangle (extends to page edges — we shift left by MARGIN)
        c.saveState()
        c.translate(-MARGIN, 0)
        c.setFillColor(DARK_BLUE)
        c.rect(0, 0, PAGE_W, self.HEIGHT, fill=1, stroke=0)

        # Subtle gradient-ish band (lighter strip at top)
        c.setFillColorRGB(1, 1, 1, alpha=0.06)
        c.rect(0, self.HEIGHT - 0.18 * inch, PAGE_W, 0.18 * inch, fill=1, stroke=0)

        # Icon + App title line
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 19)
        title = u'\u25a6  Inventory Control Dashboard'
        c.drawString(0.45 * inch, self.HEIGHT - 0.50 * inch, title)

        # Sub-tagline
        c.setFont('Helvetica', 10)
        c.setFillColorRGB(0.8, 0.88, 1.0)
        c.drawString(0.45 * inch, self.HEIGHT - 0.72 * inch,
                     'Stock \u00b7 Profit \u00b7 Restock \u2014 all in one place')

        # Divider line
        c.setStrokeColorRGB(1, 1, 1, alpha=0.25)
        c.setLineWidth(0.5)
        c.line(0.45 * inch, self.HEIGHT - 0.82 * inch,
               PAGE_W - 0.45 * inch, self.HEIGHT - 0.82 * inch)

        # Guide title
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 14)
        c.drawString(0.45 * inch, self.HEIGHT - 1.05 * inch,
                     'How to Use Your Inventory App')

        # Guide sub-description
        c.setFont('Helvetica', 9.5)
        c.setFillColorRGB(0.8, 0.88, 1.0)
        c.drawString(0.45 * inch, self.HEIGHT - 1.25 * inch,
                     'Everything you need to get started \u2014 step by step.')

        c.restoreState()

    def wrap(self, availWidth, availHeight):
        return (self.width, self.HEIGHT)


class SectionHeader(Flowable):
    """Bold uppercase blue section header with left accent bar."""
    def __init__(self, text, top_space=0.18*inch):
        Flowable.__init__(self)
        self.text = text
        self.top_space = top_space
        self.width = CONTENT_W
        self.height = 0.32 * inch + top_space

    def draw(self):
        c = self.canv
        y0 = self.top_space
        # Accent bar
        c.setFillColor(ACCENT_BLUE)
        c.rect(0, y0 + 0.04 * inch, 0.055 * inch, 0.22 * inch, fill=1, stroke=0)
        # Text
        c.setFillColor(DARK_BLUE)
        c.setFont('Helvetica-Bold', 10.5)
        c.drawString(0.1 * inch, y0 + 0.06 * inch, self.text)

    def wrap(self, availWidth, availHeight):
        return (self.width, self.height)


class Divider(Flowable):
    def __init__(self, space_before=0.06*inch, space_after=0.1*inch):
        Flowable.__init__(self)
        self.sb = space_before
        self.sa = space_after
        self.width = CONTENT_W
        self.height = self.sb + 1 + self.sa

    def draw(self):
        c = self.canv
        c.setStrokeColor(DIVIDER)
        c.setLineWidth(0.5)
        c.line(0, self.sa, self.width, self.sa)

    def wrap(self, availWidth, availHeight):
        return (self.width, self.height)


class StepBlock(Flowable):
    """Numbered step with blue circle number and two-column text layout."""
    def __init__(self, number, title, body_lines):
        Flowable.__init__(self)
        self.number = str(number)
        self.title = title
        self.body_lines = body_lines  # list of strings
        self.width = CONTENT_W
        # Estimate height: title line + body lines + bottom padding
        self.height = (0.28 + len(body_lines) * 0.175) * inch

    def draw(self):
        c = self.canv
        circle_r = 0.135 * inch
        cx = circle_r
        cy = self.height - circle_r - 0.02 * inch

        # Blue circle
        c.setFillColor(ACCENT_BLUE)
        c.circle(cx, cy, circle_r, fill=1, stroke=0)

        # Number in circle
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 9)
        tw = c.stringWidth(self.number, 'Helvetica-Bold', 9)
        c.drawString(cx - tw / 2, cy - 0.033 * inch, self.number)

        # Title
        text_x = cx + circle_r + 0.1 * inch
        c.setFillColor(DARK_BLUE)
        c.setFont('Helvetica-Bold', 10)
        # parse bold markers in title
        title_clean = self.title.replace('**', '')
        c.drawString(text_x, cy - 0.033 * inch, title_clean)

        # Body lines
        c.setFillColor(BODY_TEXT)
        c.setFont('Helvetica', 9)
        line_y = cy - 0.033 * inch - 0.195 * inch
        for line in self.body_lines:
            c.drawString(text_x, line_y, line)
            line_y -= 0.175 * inch

    def wrap(self, availWidth, availHeight):
        return (self.width, self.height)


class CalloutBox(Flowable):
    """Amber callout box for the Pro Tip."""
    def __init__(self, text_lines, bg_color=CALLOUT_AMBER, border_color=None):
        Flowable.__init__(self)
        self.text_lines = text_lines
        self.bg_color = bg_color
        self.border_color = border_color or HexColor('#F6D860')
        self.width = CONTENT_W
        self.pad = 0.14 * inch
        self.height = (2 * self.pad + len(text_lines) * 0.185 * inch + 0.05 * inch)

    def draw(self):
        c = self.canv
        # Background
        c.setFillColor(self.bg_color)
        c.setStrokeColor(self.border_color)
        c.setLineWidth(0.8)
        c.roundRect(0, 0, self.width, self.height, 0.08 * inch, fill=1, stroke=1)

        # Text lines
        y = self.height - self.pad - 0.155 * inch
        c.setFillColor(HexColor('#5C4A00'))
        for i, line in enumerate(self.text_lines):
            if i == 0:
                c.setFont('Helvetica-Bold', 9.5)
            else:
                c.setFont('Helvetica', 9)
            c.drawString(self.pad, y, line)
            y -= 0.185 * inch

    def wrap(self, availWidth, availHeight):
        return (self.width, self.height)


class SubHeader(Flowable):
    """■ Sub-section header (e.g. 'On a PC or Mac')."""
    def __init__(self, text):
        Flowable.__init__(self)
        self.text = text
        self.width = CONTENT_W
        self.height = 0.24 * inch

    def draw(self):
        c = self.canv
        c.setFillColor(DARK_BLUE)
        c.setFont('Helvetica-Bold', 9.5)
        c.drawString(0, 0.06 * inch, u'\u25a0  ' + self.text)

    def wrap(self, availWidth, availHeight):
        return (self.width, self.height)


class BulletLine(Flowable):
    """A single bullet point line with optional indent."""
    def __init__(self, text, indent=0.18*inch):
        Flowable.__init__(self)
        self.text = text
        self.indent = indent
        self.width = CONTENT_W
        self.height = 0.175 * inch

    def draw(self):
        c = self.canv
        c.setFillColor(BODY_TEXT)
        c.setFont('Helvetica', 9)
        c.drawString(self.indent, 0.02 * inch, u'\u2022  ' + self.text)

    def wrap(self, availWidth, availHeight):
        return (self.width, self.height)


class PreviewBox(Flowable):
    """Blue callout box for the live preview link note."""
    VERCEL_URL = 'https://inventory-system-kappa-one.vercel.app/'

    def __init__(self):
        Flowable.__init__(self)
        self.width = CONTENT_W
        self.height = 0.46 * inch

    def draw(self):
        c = self.canv
        c.setFillColor(CALLOUT_BLUE)
        c.setStrokeColor(ACCENT_BLUE)
        c.setLineWidth(0.8)
        c.roundRect(0, 0, self.width, self.height, 0.07 * inch, fill=1, stroke=1)

        # Label
        c.setFillColor(DARK_BLUE)
        c.setFont('Helvetica-Bold', 9)
        c.drawString(0.13 * inch, 0.28 * inch, 'Live Preview Link:')

        # Clickable URL
        url = self.VERCEL_URL
        url_x = 0.13 * inch
        url_y = 0.10 * inch
        c.setFont('Helvetica', 9)
        c.setFillColor(HexColor('#1A56DB'))
        c.drawString(url_x, url_y, url)

        # Underline
        url_w = c.stringWidth(url, 'Helvetica', 9)
        c.setStrokeColor(HexColor('#1A56DB'))
        c.setLineWidth(0.5)
        c.line(url_x, url_y - 1, url_x + url_w, url_y - 1)

        # Hyperlink annotation (relative=1 uses current canvas transform)
        c.linkURL(url,
                  (url_x, url_y - 2, url_x + url_w, url_y + 9),
                  relative=1)

    def wrap(self, availWidth, availHeight):
        return (self.width, self.height)


class FooterCanvas(canvas.Canvas):
    """Canvas subclass that draws footers on every page."""
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self._draw_footer(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def _draw_footer(self, page_count):
        page_num = self._pageNumber
        self.setFillColor(HexColor('#718096'))
        self.setFont('Helvetica', 8)
        # Left: company name
        self.drawString(MARGIN, 0.38 * inch, 'Thrive Culture LLC')
        # Right: page number
        page_str = f'Page {page_num} of {page_count}'
        tw = self.stringWidth(page_str, 'Helvetica', 8)
        self.drawString(PAGE_W - MARGIN - tw, 0.38 * inch, page_str)
        # Top line
        self.setStrokeColor(DIVIDER)
        self.setLineWidth(0.5)
        self.line(MARGIN, 0.52 * inch, PAGE_W - MARGIN, 0.52 * inch)


# ── Feature card data ──────────────────────────────────────────────

FEATURES = [
    ('Dashboard',
     'See your full business at a glance — stock counts, profit charts, '
     'low-stock alerts, and a Data Safety card so your backup is always one tap away.'),
    ('Products (Inventory)',
     'Add, edit, and delete products. Set restock thresholds and track cost vs. '
     'sale price in Simple or Advanced mode.'),
    ('Stock In / Out',
     'Log every stock movement — new shipments, sales, returns, and adjustments. '
     'Quantities update automatically.'),
    ('Profit Analysis',
     'View profit breakdowns by product and category. See your most and least '
     'profitable items instantly.'),
    ('CSV Export / Import',
     'Export your inventory to a spreadsheet-friendly CSV file, or import an '
     'existing CSV to load your data.'),
    ('Backup & Restore',
     'A \u201cSave Backup Now\u201d button is always visible on your Dashboard and in the '
     'sidebar. Restore your data on any device in under 10 seconds.'),
    ('Quick Start Guide',
     'Available anytime from the sidebar menu \u2014 reopens the same guide that '
     'appeared on your first visit.'),
    ('Settings',
     'Set a default low-stock threshold for new products and manage your app data.'),
]


def make_feature_table(styles):
    """Build a 2-column table of feature cards."""
    # Pair features into rows of 2
    rows = []
    for i in range(0, len(FEATURES), 2):
        pair = FEATURES[i:i+2]
        cells = []
        for title, body in pair:
            title_p = Paragraph(title, styles['CardTitle'])
            body_p  = Paragraph(body,  styles['CardBody'])
            cells.append([title_p, body_p])
        # Pad to 2 if odd number
        while len(cells) < 2:
            cells.append(['', ''])
        rows.append(cells)

    # Flatten: each row is [cell1_content, cell2_content]
    # Each cell_content is a list of paragraphs
    table_data = []
    for row in rows:
        left  = row[0]
        right = row[1] if len(row) > 1 else ['', '']
        table_data.append([left, right])

    col_w = (CONTENT_W - 0.12 * inch) / 2
    t = Table(table_data, colWidths=[col_w, col_w],
              spaceBefore=0, spaceAfter=0)

    ts = TableStyle([
        ('BACKGROUND',  (0, 0), (-1, -1), LIGHT_CARD),
        ('BOX',         (0, 0), (0, -1), 0.5, DIVIDER),
        ('BOX',         (1, 0), (1, -1), 0.5, DIVIDER),
        ('LEFTPADDING',  (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING',   (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING',(0, 0), (-1, -1), 7),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [LIGHT_CARD, HexColor('#F0F4F8')]),
        ('LINEBELOW', (0, 0), (-1, -2), 0.4, DIVIDER),
        ('LINEBETWEEN', (0, 0), (0, -1), 0.4, DIVIDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ])
    t.setStyle(ts)
    return t


# ── Main build function ────────────────────────────────────────────

def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=letter,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=0.35 * inch,
        bottomMargin=0.65 * inch,
        title='Inventory Control Dashboard – User Guide',
        author='Thrive Culture LLC',
    )

    # ── Styles ────────────────────────────────────────────────────
    base = getSampleStyleSheet()
    styles = {}

    styles['Body'] = ParagraphStyle(
        'Body', fontName='Helvetica', fontSize=9, leading=13.5,
        textColor=BODY_TEXT, spaceAfter=4, leftIndent=0,
    )
    styles['BulletBody'] = ParagraphStyle(
        'BulletBody', parent=styles['Body'],
        leftIndent=0.18 * inch, firstLineIndent=0,
    )
    styles['CardTitle'] = ParagraphStyle(
        'CardTitle', fontName='Helvetica-Bold', fontSize=9,
        textColor=DARK_BLUE, spaceBefore=0, spaceAfter=3, leading=12,
    )
    styles['CardBody'] = ParagraphStyle(
        'CardBody', fontName='Helvetica', fontSize=8.5, leading=12,
        textColor=BODY_TEXT, spaceBefore=0, spaceAfter=0,
    )
    styles['PrivacyBullet'] = ParagraphStyle(
        'PrivacyBullet', fontName='Helvetica', fontSize=9, leading=13.5,
        textColor=BODY_TEXT, spaceAfter=3,
        leftIndent=0.15 * inch, bulletIndent=0,
    )
    styles['BulletPara'] = ParagraphStyle(
        'BulletPara', fontName='Helvetica', fontSize=9, leading=13.5,
        textColor=BODY_TEXT, spaceAfter=5,
        leftIndent=0.26 * inch, firstLineIndent=-0.1 * inch,
    )

    # ── Story ─────────────────────────────────────────────────────
    story = []

    # ==============================  PAGE 1  ==============================

    # Header
    story.append(HeaderBlock())
    story.append(Spacer(1, 0.10 * inch))

    # Section: APP PREVIEW
    story.append(SectionHeader('APP PREVIEW'))
    story.append(Spacer(1, 0.05 * inch))
    story.append(PreviewBox())
    story.append(Spacer(1, 0.03 * inch))
    story.append(Divider())

    # Section: ACCESSING YOUR APP
    story.append(SectionHeader('ACCESSING YOUR APP', top_space=0.10*inch))
    story.append(Spacer(1, 0.05 * inch))

    def bp(text): return Paragraph(u'\u2022\u2002' + text, styles['BulletPara'])

    story.append(SubHeader('On a PC or Mac'))
    story.append(bp(
        'Locate the <b>index.html</b> file from your purchase and save it to your '
        'Desktop or Documents folder.'))
    story.append(bp(
        'Double-click the file to open it in your browser (Chrome, Safari, or Edge). '
        'No internet or installation needed \u2014 it works completely offline.'))
    story.append(Spacer(1, 0.05 * inch))

    story.append(SubHeader('On a Tablet or Phone'))
    story.append(bp(
        'Open Chrome or Safari, go to the Live Preview Link above, and <b>always use '
        'the same browser</b>. The app will prompt you to install automatically \u2014 '
        'tap <b>Install</b> on Android, or follow the on-screen guide on iPhone. '
        'You can also tap <b>Add to Home Screen</b> in the sidebar anytime.'))
    story.append(bp(
        '<b>Protect your data:</b> never clear browser data, use incognito, or switch '
        'phones <b>without a backup</b> \u2014 any of these permanently erases your inventory. '
        'Save backups to iCloud, Google Drive, or email so they survive a lost or replaced phone.'))
    story.append(Divider())

    # Section: GETTING STARTED
    story.append(SectionHeader('GETTING STARTED', top_space=0.10*inch))
    story.append(Spacer(1, 0.05 * inch))

    steps = [
        (1, 'Step 1 \u2014 Quick Start Guide opens automatically',
         ['The first time you open the app, a Quick Start Guide pops up. Tap \u201cLoad Sample Data\u201d',
          'to explore with examples, or \u201cStart Fresh\u201d to begin. Reopen it anytime from the sidebar.']),
        (2, 'Step 2 \u2014 Go to Products',
         ['Tap Products in the bottom bar (mobile) or the left sidebar (desktop). This is where',
          'you add, edit, and manage every item in your inventory.']),
        (3, 'Step 3 \u2014 Choose Simple or Advanced Mode',
         ['Simple Mode tracks cost, price, and quantity. Advanced Mode adds material, labor,',
          'and fee breakdowns for a full profit breakdown per product.']),
        (4, 'Step 4 \u2014 Monitor Your Dashboard',
         ['Your Dashboard shows stock levels, profit charts, and low-stock alerts.',
          'Items that need restocking are flagged automatically \u2014 nothing slips by.']),
        (5, 'Step 5 \u2014 Save Your Backup',
         ['Your data only lives on this device. Tap \u201cSave Backup Now\u201d on the Dashboard',
          'to download a backup file you can restore on any device at any time.']),
    ]

    for num, title, lines in steps:
        story.append(StepBlock(num, title, lines))
        story.append(Spacer(1, 0.042 * inch))

    # ==============================  PAGE 2  ==============================
    # (ReportLab will auto-page-break — content continues naturally)

    story.append(Divider(space_before=0.04*inch))
    story.append(SectionHeader('FEATURES OVERVIEW'))
    story.append(Spacer(1, 0.08 * inch))
    story.append(make_feature_table(styles))
    story.append(Spacer(1, 0.04 * inch))
    story.append(Divider())

    # Section: PRIVACY & YOUR DATA
    story.append(SectionHeader('PRIVACY & YOUR DATA'))
    story.append(Spacer(1, 0.07 * inch))

    privacy_bullets = [
        u'Your privacy is our priority. We do not store your data on any server or in the cloud.',
        u'All inventory data is saved locally in your browser on the device you\u2019re using.',
        u'Your data does not automatically sync between devices.',
        u'To move your data to another device: tap \u201cSave Backup Now\u201d on the Dashboard to '
        u'download a backup file, then open the app on the new device and use \u201cRestore Backup\u201d '
        u'to load it. The whole process takes less than 10 seconds.',
    ]
    for b in privacy_bullets:
        story.append(Paragraph(u'\u2022\u2002' + b, styles['BulletPara']))
    story.append(Spacer(1, 0.12 * inch))

    # Amber callout
    story.append(CalloutBox([
        u'\U0001f4a1  Pro Tip: Make backups a habit.',
        u'A \u201cSave Backup Now\u201d card is always visible on your Dashboard.',
        u'Save a backup after adding or updating products \u2014 it takes one tap',
        u'and protects all your work.',
    ]))

    # ── Build ─────────────────────────────────────────────────────
    doc.build(story, canvasmaker=FooterCanvas)
    print(f'PDF created: {OUTPUT_PATH}')


if __name__ == '__main__':
    build_pdf()
