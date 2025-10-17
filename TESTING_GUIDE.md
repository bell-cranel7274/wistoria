# Testing Guide - Research Form Migration

## Quick Test Steps

### 1. Start the Development Server

```powershell
npm run dev
```

### 2. Navigate to Research Page

Open your browser and go to:
```
http://localhost:4300/research
```

### 3. Test Creating a New Research Note

1. Click the **"+ New Research Entry"** button (top right)
2. ✅ Should navigate to `/research/new` with full-page form
3. Fill out the form across all 3 pages:
   
   **Page 1 - Basic Info:**
   - Enter a title (e.g., "Test Research Note")
   - Project name (e.g., "Test Project")
   - Select a category
   - Select a status

   **Page 2 - Research Details:**
   - Enter methodology
   - Enter sources
   - Enter key findings

   **Page 3 - Content:**
   - Enter additional notes
   - Enter main content

4. Click **"Save Research Note"**
5. ✅ Should navigate back to `/research` and see your new note

### 4. Test Editing an Existing Note

1. From the research library, click the **Edit button** (pencil icon) on any research card
2. ✅ Should navigate to `/research/edit/:noteId` with the form pre-filled
3. Modify some fields
4. Click **"Save Research Note"**
5. ✅ Should navigate back to `/research` with updated note

### 5. Test Navigation

**Page Navigation:**
- Click the dots at the top to jump between pages
- Click the numbered buttons (1, 2, 3) at the bottom
- Click the arrow buttons (← →) at the bottom
- ✅ All should work smoothly

**Back Navigation:**
- Click the **Cancel** button
- ✅ Should show confirmation dialog
- Click OK
- ✅ Should return to `/research`

**Browser Back:**
- Press browser back button
- ✅ Should return to `/research`

### 6. Test Responsive Design

**Desktop (1024px+):**
- ✅ Pages should be side-by-side
- ✅ Header should be sticky
- ✅ Plenty of space for content

**Tablet (768px - 1023px):**
- Resize browser window to tablet size
- ✅ Pages still side-by-side but more compact
- ✅ Buttons may stack on smaller tablet sizes

**Mobile (< 768px):**
- Resize browser to mobile size (or use device toolbar)
- ✅ Pages should stack vertically
- ✅ Header buttons may show icons only
- ✅ Navigation still works smoothly

### 7. Test Empty State

1. If you have no research notes, check the empty state
2. Click **"Create First Research Note"**
3. ✅ Should navigate to `/research/new`

## Expected Behaviors

### ✅ Success Criteria

- [x] Full-page form loads without errors
- [x] All form fields are editable
- [x] Page navigation works (dots, numbers, arrows)
- [x] Save button creates/updates notes correctly
- [x] Cancel button returns to library
- [x] Browser back button works
- [x] Responsive design adapts to screen size
- [x] No console errors
- [x] Data persists after page refresh

### ❌ Things That Should NOT Happen

- [ ] Modal dialogs appearing (old behavior)
- [ ] Form not loading on mobile
- [ ] Data loss when navigating pages
- [ ] Scroll issues within form
- [ ] Layout breaking on small screens
- [ ] Save button not working
- [ ] Navigation getting stuck

## Common Issues & Solutions

### Issue: Form doesn't save
**Solution:** Check browser console for errors. Ensure TaskContext is properly loaded.

### Issue: Edit mode doesn't load data
**Solution:** Verify the note ID in the URL matches an existing note.

### Issue: Layout looks broken
**Solution:** Check that Tailwind CSS is properly compiled. Run `npm run dev` again.

### Issue: Can't navigate between pages
**Solution:** Check that page navigation functions are working. Look for errors in console.

### Issue: Mobile layout not stacking
**Solution:** Verify responsive breakpoints in Tailwind config. Check if `lg:` prefix is working.

## Browser Compatibility

Test on multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Performance Checks

- Page should load quickly
- No lag when typing in text fields
- Page transitions should be smooth
- No memory leaks when navigating back and forth

## Accessibility Checks

- [ ] Can tab through form fields
- [ ] Enter key works on buttons
- [ ] Focus visible on all interactive elements
- [ ] Screen reader friendly labels

## Data Integrity Checks

1. Create a note with specific data
2. Navigate away and back
3. ✅ Note should still exist with correct data

4. Edit a note
5. Save changes
6. Refresh page
7. ✅ Changes should persist

8. Create a note
9. Don't save (click Cancel)
10. ✅ Note should NOT be created

## Screenshots to Take

For documentation, capture:
1. Full-page form on desktop (all 3 pages)
2. Full-page form on mobile (vertical stack)
3. Empty state with "Create First Research Note"
4. Library view after creating notes
5. Edit mode with pre-filled data

---

## Test Completion Checklist

- [ ] Create new research note - SUCCESS
- [ ] Edit existing research note - SUCCESS
- [ ] Page navigation works - SUCCESS
- [ ] Cancel/Back works - SUCCESS
- [ ] Data persists - SUCCESS
- [ ] Responsive on desktop - SUCCESS
- [ ] Responsive on tablet - SUCCESS
- [ ] Responsive on mobile - SUCCESS
- [ ] No console errors - SUCCESS
- [ ] Browser back button works - SUCCESS

## Reporting Issues

If you find any issues:
1. Note the exact steps to reproduce
2. Capture screenshots
3. Check browser console for errors
4. Note your browser and OS version
5. Document expected vs actual behavior

---

**All tests passing?** 🎉 The migration is complete and working perfectly!
