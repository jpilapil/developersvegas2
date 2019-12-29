import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux' // allows connecting redux to this react component
import axios from 'axios'
import escape_regex from 'lodash/escapeRegExp'
import sort_by from 'lodash/sortBy'
import { store_sign_in_stage } from '../../state/sign_in_stage'

class Sign_In_Search extends Component {
   constructor() {
      super()
      this.state = {
         members: [],
         filtered_members: [],
      }
      axios
         .get(`/api/v1/members`) // recall we put a PROXY value in our client package.json
         .then(res => {
            const members = sort_by(res.data, ['last_name', 'first_name'])
            this.state.members = members
            this.state.filtered_members = members
            document.getElementById('search_input').focus()
            // TODO: don't load the elements on the page until this data is returned from the API
         })
         .catch(err => console.log({ errors: err.response.data }))
   }

   search(e) {
      const input = e.target.value
      console.log(input)
      let filtered_members
      const members = [...this.state.members]
      if (input && members) {
         let input_regex = new RegExp('^' + escape_regex(input), 'i')
         filtered_members = members.filter(member => {
            return input_regex.test(member.last_name)
         })
      } else filtered_members = ''
      this.setState({ filtered_members })
   }

   sign_me_in() {
      this.props.store_sign_in_stage('Sign_In_Presentation')
   }

   im_new_here() {
      this.props.store_sign_in_stage('Sign_In_Last_Name')
   }

   render() {
      return (
         <div className="row">
            <div className="col-12 col-md-8 offset-md-2 col-lg-6 offset-lg-3 mt-3">
               <h1 className="mb-4">Sign in to Demo Day</h1>
               <label htmlFor="search_input">
                  Type your <strong>LAST NAME</strong>
               </label>
               <input
                  className="form-control mb-4"
                  type="text"
                  id="search_input"
                  autoComplete="off"
                  onInput={e => {
                     this.search(e)
                  }}
               ></input>

               {this.state.filtered_members &&
                  this.state.filtered_members.map(member => {
                     return (
                        <div key={member._id}>
                           <div className="row">
                              <div className="col-7 col-xl-8">
                                 <h3 className="d-inline mr-4">{`${member.first_name} ${member.last_name}`}</h3>
                              </div>
                              <div className="col-5 col-xl-4">
                                 <button
                                    className="btn btn-primary btn-sm btn-block"
                                    onClick={() => this.sign_me_in()}
                                 >
                                    Sign me in
                                 </button>
                              </div>
                           </div>
                           <div className="row">
                              <div className="col-12">
                                 <p className="mb-0 mt-1 mt-sm-0 text-break">
                                    {member.email}
                                 </p>
                              </div>
                           </div>

                           <div className="row">
                              <div className="col-12">
                                 <hr className="my-4" />
                              </div>
                           </div>
                        </div>
                     )
                  })}

               <div className="row mt-2">
                  <div className="col-5 offset-7 col-xl-4 offset-xl-8">
                     <button
                        className="btn btn-success btn-sm btn-block"
                        onClick={() => this.im_new_here()}
                     >
                        I'm new here
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )
   }
}

const map_store_to_props = store => {
   // so I can use stored values as props
   // https://stackoverflow.com/a/38678454
   return {
      stored_sign_in_stage: store.sign_in_stage,
   }
}
export default connect(
   map_store_to_props, // mapStateToProps
   { store_sign_in_stage } // mapDispatchToProps, here an 'action creator' wrapped in an object
)(withRouter(Sign_In_Search))