const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const event_model = require('../../../models/event')
const member_model = require('../../../models/member')
const presentation_model = require('../../../models/presentation')
const technology_model = require('../../../models/technology')
const xref_presentation_technology_model = require('../../../models/xref_presentation_technology')
const slug_format = require('../../../utils/slug_format')
const append_slug_suffix = require('../../../utils/append_slug_suffix')
const create_row_id = require('../../../utils/create_row_id')
const validate_input_for_presentation = require('../../../validation/presentation')
const cast_to_object_id = require('mongodb').ObjectID
const _has = require('lodash/has')
const _for_each = require('lodash/forEach')

// @route      POST api/v1/demo-day
// @desc       Create all data for a demo day
// @access     Public
router.post('/', (req, res) => {
   const demo_days = req.body
   // Validate user input
   // const { errors, is_valid } = validate_input_for_presentation(body)
   // if (!is_valid) {
   //    return res.status(400).json(errors)
   // }

   const agreement_id = cast_to_object_id('5d0e6f4d63f3b43f2830cd4f') // hard-coded ID of agreement 0.1
   const has_accepted_agreement = true

   _for_each(demo_days, async demo_day => {
      let event_id
      const started_on = new Date(demo_day.event.date)
      await event_model
         .findOne({ started_on })
         .then(event => (event_id = event._id))
         .catch(err => res.status(400).json(err))

      let member_id
      const row_id = demo_day.member.row_id
      await member_model
         .findOne({ row_id })
         .then(member => (member_id = member._id))
         .catch(err => res.status(400).json(err))

      console.log({ agreement_id, event_id, member_id })

      const presentation_obj = {}
      const presentation_technology_obj = {}
      // These are fields that can be updated via the API
      presentation_obj.agreement_id = agreement_id
      presentation_obj.has_accepted_agreement = has_accepted_agreement
      presentation_obj.event_id = event_id
      presentation_obj.member_id = member_id
      presentation_obj.title = demo_day.presentation.title
      presentation_obj.order = demo_day.presentation.order
      presentation_obj.is_active = demo_day.presentation.is_active
      if (demo_day.presentation.video_screenshot_url)
         presentation_obj.video_screenshot_url =
            demo_day.presentation.video_screenshot_url
      if (demo_day.presentation.video_screenshot_with_play_url)
         presentation_obj.video_screenshot_with_play_url =
            demo_day.presentation.video_screenshot_with_play_url
      if (demo_day.presentation.video_url)
         presentation_obj.video_url = demo_day.presentation.video_url
      if (demo_day.presentation.video_iframe)
         presentation_obj.video_iframe = demo_day.presentation.video_iframe

      const technologies = demo_day.technologies.map(
         technology => technology.id // an array of numbers
      )

      await presentation_model
         .findOne({
            event_id: presentation_obj.event_id,
            order: presentation_obj.order,
         })
         .then(async presentation => {
            if (presentation) {
               // if our search matches a document, update
               presentation_model
                  .findByIdAndUpdate(
                     presentation._id,
                     { $set: presentation_obj },
                     { new: true }
                  )
                  .then(updated_presentation => {
                     // update presentation_technology
                     // append to custom JSON response
                  })
                  .catch(err => res.status(400).json(err))
            } else {
               // Create presentation
               let slug = slug_format(
                  presentation_obj.title || 'untitled-project'
               ) // 'title-of-presentation' or 'untitled-project'
               presentation_obj.slug = await append_slug_suffix(
                  presentation_model,
                  slug
               )
               presentation_obj.row_id = await create_row_id(presentation_model)

               if (!_has(presentation_obj, 'video_screenshot_url'))
                  presentation_obj.video_screenshot_url = ''
               if (!_has(presentation_obj, 'video_screenshot_with_play_url'))
                  presentation_obj.video_screenshot_with_play_url = ''
               if (!_has(presentation_obj, 'video_url'))
                  presentation_obj.video_url = ''
               if (!_has(presentation_obj, 'video_iframe'))
                  presentation_obj.video_iframe = ''

               new presentation_model(presentation_obj)
                  .save()
                  .then(presentation => {
                     presentation_technology_obj.presentation_id =
                        presentation._id
                     // update presentation_technology
                     // append to custom JSON response
                  })
                  .catch(err => res.status(400).json(err))
            }
         })
         .catch(err => res.status(400).json(err))

      _for_each(technologies, async row_id => {
         await technology_model
            .findOne({ row_id })
            .then(
               technology =>
                  (presentation_technology_obj.technology_id = technology._id)
            )
            .catch(err => res.status(400).json(err))

         new xref_presentation_technology_model(presentation_technology_obj)
            .save()
            .then(presentation_technology => {
               // append to custom JSON response
            })
            .catch(err => res.status(400).json(err))
      })
   })
   // res.json(presentation) return a custom response with all fields
})

const example_api_return = {
   _id: mongoose.Schema.Types.ObjectId,
   title: String,
   signed_up_on: Date,
   has_accepted_agreement: Boolean,
   order: Number,
   video_url: String,
   video_screenshot_url: String,
   is_active: Boolean,
   slug: String,
   row_id: Number,
}

module.exports = router